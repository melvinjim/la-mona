"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "../actions";
import { SubmitButton } from "./SubmitButton";
import { Alert, Field, inputClass, restore } from "./ui";

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(signIn, {});
  const old = restore(state.values);

  return (
    <form action={action} className="space-y-4">
      <Field label="Correo">
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={old.text("email")}
          className={inputClass}
        />
      </Field>
      <Field label="Contraseña">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      <Alert state={state} />

      <SubmitButton>Entrar</SubmitButton>
    </form>
  );
}
