import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/components/ui/notifications";
import { useAcceptTeamInvitation, teamQueryKeys } from "@/features/team/api/team";
import { TEAM_INVITATION_TOKEN_KEY } from "@/features/team/constants";
import { useUser } from "@/lib/auth";

export const AcceptInviteRoute: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const user = useUser();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = searchParams.get("token");

  const { mutate, isPending } = useAcceptTeamInvitation({
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: teamQueryKeys.summary });
      void queryClient.invalidateQueries({ queryKey: teamQueryKeys.members });
      void queryClient.invalidateQueries({ queryKey: teamQueryKeys.invitations });
      void queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      try {
        window.sessionStorage.removeItem(TEAM_INVITATION_TOKEN_KEY);
      } catch (storageError) {
        console.warn("Unable to clear invitation token", storageError);
      }
      addNotification({
        type: "success",
        title: response?.companyName ? `Welcome to ${response.companyName}` : "Invitation accepted",
        message: response?.companyName
          ? `You're all set to collaborate with ${response.companyName}.`
          : "Your workspace access is ready to go.",
      });
      navigate("/app", { replace: true });
    },
    onError: (error) => {
      const problem = error as { response?: { data?: { detail?: string; code?: string } } };
      const detail = problem.response?.data?.detail;
      const code = problem.response?.data?.code;
      let message = detail ?? "Unable to accept invitation.";
      if (code === "Users.InvalidOrExpiredInvitation") {
        message = "This invitation is invalid or has expired.";
      } else if (code === "Users.CompanyUserLimitReached") {
        message = "This team is at capacity. Ask the workspace owner to upgrade their plan.";
      } else if (code === "Users.UserAlreadyInCompany") {
        message = "You already belong to this workspace.";
      }
      setErrorMessage(message);
      addNotification({
        type: "error",
        title: "Invite could not be accepted",
        message,
      });
    },
  });

  useEffect(() => {
    if (!token) {
      setErrorMessage("Invitation token is missing or invalid.");
      addNotification({
        type: "error",
        title: "Missing token",
        message: "Invitation token is missing.",
      });
      return;
    }

    if (user.isLoading) {
      return;
    }

    if (user.data) {
      mutate({ token });
      return;
    }

    try {
      window.sessionStorage.setItem(TEAM_INVITATION_TOKEN_KEY, token);
    } catch (storageError) {
      console.warn("Unable to persist invitation token", storageError);
    }

    navigate(`/register?invitation=${encodeURIComponent(token)}`, { replace: true });
  }, [token, mutate, addNotification, user.isLoading, user.data, navigate]);

  const isProcessing = isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-primary/40 bg-surface-primary/95 p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold text-text-primary">Accept invitation</h1>
        <p className="mt-3 text-sm text-text-secondary">
          {errorMessage
            ? errorMessage
            : isProcessing
            ? "We are validating your invitation token."
            : "Your invitation has been processed."}
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate(errorMessage ? "/login" : "/app")}>Back to {errorMessage ? "login" : "dashboard"}</Button>
        </div>
      </div>
    </div>
  );
};
