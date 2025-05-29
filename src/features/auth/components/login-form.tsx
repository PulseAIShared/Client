import * as React from "react";
import { FieldError } from "react-hook-form";
import { z } from "zod";
import { loginInputSchema, useLogin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, Input } from "@/components/ui/form";


type LoginFormProps = {
  onSuccess: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const login = useLogin({ onSuccess });
  return (
    <div>
      <Form<z.infer<typeof loginInputSchema>, typeof loginInputSchema>
        onSubmit={(values) => login.mutate(values)}
        schema={loginInputSchema}
        options={{ shouldUnregister: true }}
      >
        {({ register, formState }) => (
          <>
            <Input
              type="email"
              label="Enter your email"
              error={formState.errors["email"] as FieldError | undefined}
              registration={register("email")}
            />

            <Input
              type="password"
              label="Password"
              error={formState.errors["password"] as FieldError | undefined}
              registration={register("password")}
              className="`w-full mt-1 p-2 border  rounded-md focus:outline-none`"
            />

            <div className="mt-6">
              <Button
                isLoading={login.isPending}
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full hover:cursor-pointer"
              >
                Login
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};
