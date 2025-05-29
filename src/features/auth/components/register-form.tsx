
import { FieldError,  } from "react-hook-form";
import { z } from "zod";
import { registerInputSchema, useRegister } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, Input } from "@/components/ui/form";


type RegisterFormProps = {
  onSuccess: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const registering = useRegister({ onSuccess });

  return (
    <div>
      <Form
        onSubmit={(values: z.infer<typeof registerInputSchema>) => registering.mutate(values)}
        schema={registerInputSchema}
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
              type="text"
              label="First name"
              error={formState.errors["firstName"] as FieldError | undefined}
              registration={register("firstName")}
            />
                  <Input
              type="text"
              label="Last name"
              error={formState.errors["lastName"] as FieldError | undefined}
              registration={register("lastName")}
            />
            <Input
              type="password"
              label="Password"
              error={formState.errors["password"] as FieldError | undefined}
              registration={register("password")}
            />

            <div>
              <Button
                isLoading={registering.isPending}
                type="submit"
                className="w-full"
              >
                Create my account
              </Button>
            </div>
          </>
        )}
      </Form>

    </div>
  );
};
