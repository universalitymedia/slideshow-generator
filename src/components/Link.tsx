import type { ReactNode } from "react";
import { href } from "../router";

export const Link = ({ to, children }: { to: string; children: ReactNode }) => <a className="link" href={href(to)}>{children}</a>;
