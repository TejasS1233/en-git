import { AppSidebar } from "@/components/blocks/Dashboard/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, Link, useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import Achievements from "@/components/Achievements";
import { useAuth } from "@/context/AuthContext";

export default function AchievementsPage() {
  usePageTitle("Achievements");
  const { user } = useAuth();
  const { username: urlUsername } = useParams();
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Get GitHub username from URL params or user data
  const githubUsername = urlUsername || user?.githubUsername || user?.username;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                  const href = "/" + pathSegments.slice(0, index + 1).join("/");
                  const isLast = index === pathSegments.length - 1;
                  return (
                    <BreadcrumbItem key={href}>
                      {isLast ? (
                        <BreadcrumbPage>
                          {segment.charAt(0).toUpperCase() + segment.slice(1)}
                        </BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink asChild>
                            <Link to={href}>
                              {segment.charAt(0).toUpperCase() + segment.slice(1)}
                            </Link>
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      )}
                    </BreadcrumbItem>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {githubUsername ? (
            <Achievements username={githubUsername} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Please connect your GitHub account to view achievements
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
