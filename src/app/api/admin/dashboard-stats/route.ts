import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Inisialisasi Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function untuk create supabase client dengan proper SSR handling
function createSupabaseClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  try {
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    // Get current user from session
    const supabase = createSupabaseClient(request, response);
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Failed to create Supabase client' 
      }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'User not authenticated' 
      }, { status: 401 });
    }

    // Get user's cluster_id from user_permissions
    const { data: userPermissions, error: permError } = await supabaseAdmin
      .from('user_permissions')
      .select('cluster_id, role')
      .eq('user_id', user.id)
      .single();

    if (permError || !userPermissions) {
      return NextResponse.json({ 
        error: 'User permissions not found' 
      }, { status: 404 });
    }

    const clusterId = userPermissions.cluster_id;

    // Get current month and previous month for comparison
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // 1. Total Jumlah Warga (KK)
    const { data: totalWarga } = await supabaseAdmin
      .from('user_permissions')
      .select('id')
      .eq('cluster_id', clusterId)
      .eq('role', 'user');

    const totalWargaCount = totalWarga?.length || 0;

    // Get previous month count for comparison
    const { data: prevMonthWarga } = await supabaseAdmin
      .from('user_permissions')
      .select('id')
      .eq('cluster_id', clusterId)
      .eq('role', 'user')
      .lt('created_at', new Date(currentYear, currentMonth, 1).toISOString());

    const prevMonthCount = prevMonthWarga?.length || 0;
    const wargaChange = prevMonthCount > 0 ? ((totalWargaCount - prevMonthCount) / prevMonthCount * 100).toFixed(0) : '0';

    // 2. Saldo/Kas (dari ledgers)
    const { data: currentBalance } = await supabaseAdmin
      .from('ledgers')
      .select('amount, ledger_type')
      .eq('cluster_id', clusterId);

    let saldo = 0;
    if (currentBalance) {
      currentBalance.forEach(entry => {
        if (entry.ledger_type === 'income') {
          saldo += entry.amount;
        } else if (entry.ledger_type === 'expense') {
          saldo -= entry.amount;
        }
      });
    }

    // Get previous month balance
    const { data: prevMonthBalance } = await supabaseAdmin
      .from('ledgers')
      .select('amount, ledger_type')
      .eq('cluster_id', clusterId)
      .lt('created_at', new Date(currentYear, currentMonth, 1).toISOString());

    let prevSaldo = 0;
    if (prevMonthBalance) {
      prevMonthBalance.forEach(entry => {
        if (entry.ledger_type === 'income') {
          prevSaldo += entry.amount;
        } else if (entry.ledger_type === 'expense') {
          prevSaldo -= entry.amount;
        }
      });
    }

    const saldoChange = saldo - prevSaldo;

    // 3. Pemasukan Kas (bulan ini)
    const { data: currentIncome } = await supabaseAdmin
      .from('ledgers')
      .select('amount')
      .eq('cluster_id', clusterId)
      .eq('ledger_type', 'income')
      .gte('created_at', new Date(currentYear, currentMonth, 1).toISOString())
      .lt('created_at', new Date(currentYear, currentMonth + 1, 1).toISOString());

    const pemasukanKas = currentIncome?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

    // Get previous month income
    const { data: prevMonthIncome } = await supabaseAdmin
      .from('ledgers')
      .select('amount')
      .eq('cluster_id', clusterId)
      .eq('ledger_type', 'income')
      .gte('created_at', new Date(previousYear, previousMonth, 1).toISOString())
      .lt('created_at', new Date(currentYear, currentMonth, 1).toISOString());

    const prevPemasukanKas = prevMonthIncome?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
    const pemasukanChange = pemasukanKas - prevPemasukanKas;

    // 4. Pengeluaran RT (bulan ini)
    const { data: currentExpense } = await supabaseAdmin
      .from('ledgers')
      .select('amount')
      .eq('cluster_id', clusterId)
      .eq('ledger_type', 'expense')
      .gte('created_at', new Date(currentYear, currentMonth, 1).toISOString())
      .lt('created_at', new Date(currentYear, currentMonth + 1, 1).toISOString());

    const pengeluaranRT = currentExpense?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

    // Get previous month expense
    const { data: prevMonthExpense } = await supabaseAdmin
      .from('ledgers')
      .select('amount')
      .eq('cluster_id', clusterId)
      .eq('ledger_type', 'expense')
      .gte('created_at', new Date(previousYear, previousMonth, 1).toISOString())
      .lt('created_at', new Date(currentYear, currentMonth, 1).toISOString());

    const prevPengeluaranRT = prevMonthExpense?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
    const pengeluaranChange = pengeluaranRT - prevPengeluaranRT;

    // 5. Recent Pemasukan (last 5)
    const { data: recentPemasukan } = await supabaseAdmin
      .from('ledgers')
      .select(`
        amount,
        description,
        created_at,
        user_permission:user_permissions(
          profile:profiles(fullname)
        )
      `)
      .eq('cluster_id', clusterId)
      .eq('ledger_type', 'income')
      .order('created_at', { ascending: false })
      .limit(5);

    // 6. Recent Pengeluaran (last 5)
    const { data: recentPengeluaran } = await supabaseAdmin
      .from('ledgers')
      .select(`
        amount,
        description,
        created_at
      `)
      .eq('cluster_id', clusterId)
      .eq('ledger_type', 'expense')
      .order('created_at', { ascending: false })
      .limit(5);

    // 7. Warga Menunggak (overdue invoices)
    const { data: overdueInvoices } = await supabaseAdmin
      .from('invoices')
      .select(`
        bill_amount,
        due_date,
        user_permission:user_permissions(
          profile:profiles(fullname, no_telp, address)
        )
      `)
      .eq('cluster_id', clusterId)
      .eq('invoice_status', 'unpaid')
      .lt('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(5);

    // Format data for response
    const dashboardStats = {
             totalWarga: {
         value: `${totalWargaCount} KK`,
         change: `${wargaChange}%`,
         changeType: Number(wargaChange) >= 0 ? 'positive' : 'negative',
         description: 'Warga baru sejak bulan lalu'
       },
      saldo: {
        value: `Rp${saldo.toLocaleString('id-ID')}`,
        change: `${saldoChange >= 0 ? '+' : ''}${(saldoChange / 1000).toFixed(0)}rb`,
        changeType: saldoChange >= 0 ? 'positive' : 'negative',
        description: 'Saldo naik dari bulan lalu'
      },
      pemasukanKas: {
        value: `Rp${pemasukanKas.toLocaleString('id-ID')}`,
        change: `${pemasukanChange >= 0 ? '+' : ''}${(pemasukanChange / 1000).toFixed(0)}rb`,
        changeType: pemasukanChange >= 0 ? 'positive' : 'negative',
        description: 'Lebih rendah dari bulan lalu'
      },
             pengeluaranRT: {
         value: `Rp${pengeluaranRT.toLocaleString('id-ID')}`,
         change: `${Number(pengeluaranChange) >= 0 ? '+' : ''}${(Number(pengeluaranChange) / 1000).toFixed(0)}rb`,
         changeType: Number(pengeluaranChange) <= 0 ? 'positive' : 'negative', // Pengeluaran turun = positif
         description: 'Pengeluaran turun bulan ini'
       },
             recentPemasukan: recentPemasukan?.map(item => ({
         name: `Iuran ${item.user_permission?.[0]?.profile?.[0]?.fullname || 'Unknown'}`,
         description: item.description,
         amount: `Rp${item.amount.toLocaleString('id-ID')}`,
         date: new Date(item.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
       })) || [],
       recentPengeluaran: recentPengeluaran?.map(item => ({
         name: item.description,
         description: item.description,
         amount: `Rp${item.amount.toLocaleString('id-ID')}`,
         date: new Date(item.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
       })) || [],
       wargaMenunggak: overdueInvoices?.map(item => ({
         name: item.user_permission?.[0]?.profile?.[0]?.fullname || 'Unknown',
         address: item.user_permission?.[0]?.profile?.[0]?.address || 'Alamat tidak tersedia',
         amount: `Rp${item.bill_amount.toLocaleString('id-ID')}`
       })) || []
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard statistics' 
    }, { status: 500 });
  }
}
