/** Shape returned by `GET /me`. */
export type Me = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};
