import React, { useMemo, useState } from "react";
import { useNotifications } from "@/components/ui/notifications";
import { useAuthorization } from "@/lib/authorization";
import { useModal } from "@/app/modal-provider";
import { Button } from "@/components/ui/button";
import {
  teamQueryKeys,
  useRevokeTeamInvitation,
  useSendTeamInvitation,
  useTeamInvitations,
  useTeamMembers,
  useTeamSummary,
  parseTeamProblem,
} from "../api/team";
import { useQueryClient } from "@tanstack/react-query";
import { CompanyRole, TeamInvitationResponse, formatCompanyRole } from "@/types/api";
import { AppPageHeader } from "@/components/layouts";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const formatRelative = (value?: string | null) => {
  if (!value) return "";
  const now = Date.now();
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return "";
  const diff = date - now;
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} remaining`;
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  return "Expires today";
};

type InviteTeamMemberModalProps = {
  onClose: () => void;
};

const InviteTeamMemberModal: React.FC<InviteTeamMemberModalProps> = ({ onClose }) => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CompanyRole>(CompanyRole.Staff);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendInvitation = useSendTeamInvitation({
    onSuccess: () => {
      addNotification({
        type: "success",
        title: "Invitation sent",
        message: `Invitation sent to ${email}.`,
      });
      setEmail("");
      setRole(CompanyRole.Staff);
      setErrorMessage(null);
      void queryClient.invalidateQueries({ queryKey: teamQueryKeys.summary });
      void queryClient.invalidateQueries({ queryKey: teamQueryKeys.members });
      void queryClient.invalidateQueries({ queryKey: teamQueryKeys.invitations });
      onClose();
    },
    onError: (error) => {
      const problem = parseTeamProblem(error);
      if (problem.code === "Users.CompanyUserLimitReached") {
        setErrorMessage("You have reached your seat limit. Upgrade your plan to invite more teammates.");
      } else if (problem.code === "Users.UserAlreadyExists") {
        setErrorMessage("This user already has access. Manage their role from the teammates list instead.");
      } else if (problem.code === "Users.InvitationAlreadySent") {
        setErrorMessage("An invitation has already been sent to this email. Revoke it before sending a new one.");
      } else {
        setErrorMessage(problem.detail ?? "Unable to send invitation. Please try again.");
      }
      if (problem.traceId) {
        addNotification({
          type: "error",
          title: "Invitation failed",
          message: `${problem.detail ?? "Invite could not be sent."} (trace ${problem.traceId})`,
        });
      }
    },
  });

  const isValidEmail = (value: string) => /.+@.+\..+/.test(value.trim());

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!isValidEmail(email)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }
    await sendInvitation.mutateAsync({ email: email.trim(), role });
  };

  const pending = sendInvitation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-primary/40 bg-surface-primary/95 p-6 shadow-2xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Invite a teammate</h2>
          <p className="text-sm text-text-secondary">Send an email invitation to join your workspace.</p>
        </div>

        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-text-secondary">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
              placeholder="teammate@company.com"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-text-secondary">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as CompanyRole)}
              className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value={CompanyRole.Viewer}>{formatCompanyRole(CompanyRole.Viewer)}</option>
              <option value={CompanyRole.Staff}>{formatCompanyRole(CompanyRole.Staff)}</option>
              <option value={CompanyRole.Owner}>{formatCompanyRole(CompanyRole.Owner)}</option>
            </select>
          </label>

          {errorMessage ? (
            <div className="rounded-lg border border-error/40 bg-error/15 p-3 text-sm text-error-muted">{errorMessage}</div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:from-accent-primary hover:to-accent-secondary"
            onClick={handleSubmit}
            disabled={pending}
            isLoading={pending}
          >
            Send invite
          </Button>
        </div>
      </div>
    </div>
  );
};

export const TeamPage: React.FC = () => {
  const { canManageCompany } = useAuthorization();
  const { addNotification } = useNotifications();
  const { openModal, closeModal } = useModal();
  const queryClient = useQueryClient();
  const canManage = canManageCompany();

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useTeamSummary({ enabled: canManage });
  const { data: members, isLoading: membersLoading } = useTeamMembers({ enabled: canManage });
  const { data: invitations, isLoading: invitationsLoading } = useTeamInvitations({ enabled: canManage });

  const revokeInvitation = useRevokeTeamInvitation({
    onSuccess: () => {
      addNotification({
        type: "success",
        title: "Invitation revoked",
        message: "The invitation has been cancelled.",
      });
      void queryClient.invalidateQueries({ queryKey: teamQueryKeys.summary });
      void queryClient.invalidateQueries({ queryKey: teamQueryKeys.members });
      void queryClient.invalidateQueries({ queryKey: teamQueryKeys.invitations });
    },
    onError: (error) => {
      const problem = parseTeamProblem(error);
      addNotification({
        type: "error",
        title: "Unable to revoke invitation",
        message: `${problem.detail ?? "Unexpected error revoking invitation."}${problem.traceId ? ` (trace ${problem.traceId})` : ""}`,
      });
    },
  });

  const handleInvite = () => {
    openModal(<InviteTeamMemberModal onClose={closeModal} />);
  };

  const pendingInvites: TeamInvitationResponse[] = useMemo(() => {
    if (!invitations) return [];
    const now = Date.now();
    return invitations.filter((invite) => {
      if (invite.isAccepted) return false;
      if (!invite.expiresAt) return true;
      return new Date(invite.expiresAt).getTime() > now;
    });
  }, [invitations]);

  const historicalInvites: TeamInvitationResponse[] = useMemo(() => {
    if (!invitations) return [];
    const now = Date.now();
    return invitations.filter((invite) => invite.isAccepted || (invite.expiresAt && new Date(invite.expiresAt).getTime() <= now));
  }, [invitations]);

  if (!canManage) {
    return (
      <div className="space-y-6">
        <AppPageHeader
          title="Team"
          description="Manage teammates, invitations, and plan seat usage."
          compact
        />
        <div className="rounded-2xl border border-border-primary/40 bg-surface-primary/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-text-primary">Team management</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Only workspace owners can manage the team. Contact an owner if you need access.
          </p>
        </div>
      </div>
    );
  }

  if (summaryLoading || membersLoading || invitationsLoading) {
    return (
      <div className="space-y-6">
        <AppPageHeader
          title="Team"
          description="Manage teammates, invitations, and plan seat usage."
          compact
        />
        <div className="flex items-center justify-center rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-8 text-text-secondary">
          Loading team data...
        </div>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="space-y-6">
        <AppPageHeader
          title="Team"
          description="Manage teammates, invitations, and plan seat usage."
          compact
        />
        <div className="rounded-2xl border border-error/40 bg-error/15 p-6 text-error-muted">
          Unable to load team summary.
        </div>
      </div>
    );
  }

  const summaryRecord = summary as Record<string, unknown> | undefined;
  const resolvedPlanName =
    summary?.planName ??
    (summaryRecord?.['plan'] as string | undefined) ??
    (summaryRecord?.['planDisplayName'] as string | undefined) ??
    '-';
  const resolvedMemberCount =
    summary?.memberCount ??
    (summaryRecord?.['activeUsers'] as number | undefined) ??
    (summaryRecord?.['memberCount'] as number | undefined) ??
    0;
  const resolvedMaxSeats =
    summary?.maxSeats ??
    (summaryRecord?.['maxUsers'] as number | undefined) ??
    (summaryRecord?.['maxSeats'] as number | undefined) ??
    undefined;
  const resolvedPendingInvites =
    summary?.pendingInvitations ??
    (summaryRecord?.['pendingInvitations'] as number | undefined) ??
    (summaryRecord?.['pendingInvites'] as number | undefined) ??
    0;

  return (
    <div className="space-y-8">
      <AppPageHeader
        title="Team"
        description="Manage teammates, invitations, and plan seat usage."
        actions={(
          <Button
            className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:from-accent-primary hover:to-accent-secondary"
            onClick={handleInvite}
          >
            Invite teammate
          </Button>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border-primary/30 bg-surface-primary/80 p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">Plan</p>
          <p className="mt-2 text-lg font-semibold text-text-primary">{resolvedPlanName}</p>
        </div>
        <div className="rounded-xl border border-border-primary/30 bg-surface-primary/80 p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">Active teammates</p>
          <p className="mt-2 text-lg font-semibold text-text-primary">{resolvedMemberCount}</p>
        </div>
        <div className="rounded-xl border border-border-primary/30 bg-surface-primary/80 p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">Seat limit</p>
          <p className="mt-2 text-lg font-semibold text-text-primary">{resolvedMaxSeats ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-border-primary/30 bg-surface-primary/80 p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">Pending invites</p>
          <p className="mt-2 text-lg font-semibold text-text-primary">{resolvedPendingInvites}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border-primary/40 bg-surface-primary/90 p-6 shadow-lg">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Teammates</h2>
            <p className="text-sm text-text-secondary">Current members with access to your workspace.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-primary/40">
            <thead className="bg-surface-secondary/60 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left">Name</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">Email</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">Role</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/30 text-sm text-text-secondary">
              {members?.map((member) => (
                <tr key={member.userId}>
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3">{formatCompanyRole(member.role)}</td>
                  <td className="px-4 py-3">{formatDate(member.joinedAt)}</td>
                </tr>
              ))}
              {(!members || members.length === 0) && (
                <tr>
                  <td className="px-4 py-6 text-center text-text-muted" colSpan={4}>
                    No teammates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-primary/40 bg-surface-primary/90 p-6 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Pending invites</h2>
              <p className="text-sm text-text-secondary">Invitations waiting for acceptance.</p>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {pendingInvites.length === 0 ? (
              <div className="rounded-lg border border-border-primary/30 bg-surface-secondary/70 p-4 text-sm text-text-muted">
                No pending invitations.
              </div>
            ) : (
              pendingInvites.map((invite) => (
                <div key={invite.invitationId} className="flex flex-col gap-2 rounded-lg border border-border-primary/30 bg-surface-secondary/60 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-text-primary">{invite.email}</p>
                      <p className="text-xs text-text-muted">
                        Invited {formatDate(invite.invitedAt)} · Role {formatCompanyRole(invite.role)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => revokeInvitation.mutate(invite.invitationId)}
                      disabled={revokeInvitation.isPending}
                    >
                      Revoke
                    </Button>
                  </div>
                  <p className="text-xs text-text-muted">{formatRelative(invite.expiresAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border-primary/40 bg-surface-primary/90 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-text-primary">Invitation history</h2>
          <p className="text-sm text-text-secondary">Previously accepted or expired invitations.</p>
          <div className="mt-4 space-y-3">
            {historicalInvites.length === 0 ? (
              <div className="rounded-lg border border-border-primary/30 bg-surface-secondary/70 p-4 text-sm text-text-muted">
                No historical invitations to display.
              </div>
            ) : (
              historicalInvites.map((invite) => (
                <div key={invite.invitationId} className="rounded-lg border border-border-primary/30 bg-surface-secondary/60 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-text-primary">{invite.email}</p>
                      <p className="text-xs text-text-muted">
                        Role {formatCompanyRole(invite.role)} · Sent {formatDate(invite.invitedAt)}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">
                      {invite.isAccepted ? `Accepted ${formatDate(invite.acceptedAt)}` : 'Expired'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
