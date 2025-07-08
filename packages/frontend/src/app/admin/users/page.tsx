import { AppSidebar } from "@/components/admin/app-sidebar"; import
{ Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage,
BreadcrumbSeparator, } from "@/components/ui/breadcrumb"; import { Separator }
from "@/components/ui/separator"; import { SidebarInset, SidebarProvider,
SidebarTrigger, } from "@/components/ui/sidebar"; export default function
AdminPage() { return (
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                Etalas
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>admin</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold">users Page</h1>
        <p>This is the users page content.</p>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div
        className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"
      />
    </div>
  </SidebarInset>
</SidebarProvider>
); }