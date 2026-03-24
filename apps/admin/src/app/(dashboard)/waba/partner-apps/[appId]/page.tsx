import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  IconArrowLeft,
  IconBuildingStore,
  IconMail,
  IconWorld,
  IconMapPin,
} from "@tabler/icons-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

type ProfileData = {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  industry?: string;
  websites?: string[];
  vertical?: string;
  profilePictureUrl?: string;
  [key: string]: unknown;
};

type PageProps = {
  params: {
    appId: string;
  };
};

const fetchAppProfile = async (appId: string) => {
  try {
    const res = await fetch(
      `${API_BASE}/api/waba/partner-apps/${appId}/profile`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      console.error(
        `Failed to fetch app profile: ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const body = await res.json();

    if (!body?.success) {
      console.error("Invalid response format:", body);
      return null;
    }

    return body.data as ProfileData;
  } catch (error) {
    console.error("Error fetching app profile:", error);
    return null;
  }
};

const PartnerAppDetailPage = async ({ params }: PageProps) => {
  const { appId } = params;
  const profile = await fetchAppProfile(appId);

  if (!profile) {
    notFound();
  }

  // Build profile photo URL
  const profilePhotoUrl = `${API_BASE}/api/waba/partner-apps/${appId}/profile/photo`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/waba/partner-apps">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Partner App Details</h1>
          <p className="text-muted-foreground text-sm">
            Business profile information
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Profile Overview Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profilePhotoUrl} alt="Business Profile" />
              <AvatarFallback>
                <IconBuildingStore className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-muted-foreground mb-2 font-mono text-xs">
                App ID: {appId}
              </p>
              {profile.industry && (
                <Badge variant="secondary">{profile.industry}</Badge>
              )}
              {profile.vertical && (
                <Badge variant="outline" className="ml-2">
                  {profile.vertical}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.about && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">About</h3>
                <p className="text-muted-foreground text-sm">{profile.about}</p>
              </div>
            )}

            {profile.description && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Description</h3>
                <p className="text-muted-foreground text-sm">
                  {profile.description}
                </p>
              </div>
            )}

            <Separator />

            <div className="grid gap-3 md:grid-cols-2">
              {profile.email && (
                <div className="flex items-center gap-2">
                  <IconMail className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
              )}

              {profile.address && (
                <div className="flex items-center gap-2">
                  <IconMapPin className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{profile.address}</span>
                </div>
              )}

              {profile.websites && profile.websites.length > 0 && (
                <div className="flex items-start gap-2 md:col-span-2">
                  <IconWorld className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex flex-col gap-1">
                    {profile.websites.map((website, idx) => (
                      <a
                        key={idx}
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline"
                      >
                        {website}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw Data Card (for debugging) */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Profile Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted overflow-auto rounded-md p-4 text-xs">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerAppDetailPage;
