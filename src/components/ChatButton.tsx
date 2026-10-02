import type { ReactNode } from "react";
import type { ChatLink } from "@/lib/order";
import { InstagramIcon, WhatsAppIcon } from "./brand-icons";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./button-styles";

type Props = {
  chat: ChatLink | null;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
};

/** Abre el chat directo (sin pedido armado) para preguntas. */
export function ChatButton({
  chat,
  variant = "light",
  size = "lg",
  className = "",
  children,
}: Props) {
  if (!chat) return null;
  const Icon = chat.channel === "whatsapp" ? WhatsAppIcon : InstagramIcon;
  const label =
    children ??
    (chat.channel === "whatsapp" ? "Escribir por WhatsApp" : "Escribir por Instagram");

  return (
    <a
      href={chat.href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass(variant, size, className)}
    >
      <Icon className="size-5 shrink-0" />
      {label}
      <span className="sr-only">(se abre en una pestaña nueva)</span>
    </a>
  );
}
