"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserApi, type UserDto } from "@/lib/api/identity/user";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Toast } from "@/lib/utils/toast";
import { Toggle } from "@/components/ui/Toggle";
import Empty from "@/components/ui/Empty";

export default function DashboardTeamPage() {
  const { m } = useI18n();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);

  const fetchUsers = async () => {
    const [/*mine*/, team] = await Promise.all([UserApi.me(), UserApi.listTeam()]);
    return team.users;
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const users = await fetchUsers();
        if (!cancelled) setUsers(users);
      } catch (e) {
        if (!cancelled) Toast.error(getApiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Team</h1>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-medium">Invite teammate</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-black/60 mb-1">Email</div>
            <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-black/60 mb-1">Name</div>
            <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm"></div>
        <Button
          disabled={inviting || !inviteEmail.trim() || !inviteName.trim()}
          onClick={async () => {
            setInviting(true);
            try {
              const res = await UserApi.createInvitation({
                email: inviteEmail.trim(),
                name: inviteName.trim(),
              });
              Toast.success("Invitation sent");
              setInviteEmail("");
              setInviteName("");
              if (res.dev?.password) {
                Toast.success(`Dev password: ${res.dev.password}`);
              }
            } catch (e) {
              Toast.error(getApiErrorMessage(e));
            } finally {
              setInviting(false);
            }
          }}
        >
          {inviting ? "Sending…" : "Send invite"}
        </Button>
      </Card>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : users.length === 0 ? (
          <Empty
            variant="customers"
            title={m.pages.team.empty}
            description={m.pages.team.emptyDescription}
          />
        ) : (
          <DataTable
            data={users}
            getRowId={(row) => row.id}
            columns={[
              { key: "email", header: "Email" },
              { key: "name", header: "Name" },
              {
                key: "isActive",
                header: "Active",
                render: (row) => (
                  <Toggle
                    checked={row.isActive}
                    onLabel="Active"
                    offLabel="Inactive"
                    aria-label={`Toggle active for ${row.email}`}
                    onCheckedChange={async (next) => {
                      try {
                        await UserApi.patchTeamMember(row.id, { isActive: next });
                        Toast.saved();
                        const refreshedUsers = await fetchUsers();
                        setUsers(refreshedUsers);
                      } catch (e) {
                        Toast.error(getApiErrorMessage(e));
                      }
                    }}
                  />
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
