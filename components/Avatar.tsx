type Props = {
  url?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ url, name, email, size = 40, className = "" }: Props) {
  const initial = ((name ?? email ?? "?").trim().charAt(0) || "?").toUpperCase();
  const style = { width: size, height: size, fontSize: Math.max(12, size * 0.4) };
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        style={style}
        className={
          "shrink-0 rounded-full object-cover bg-[var(--color-sage-soft)] " + className
        }
      />
    );
  }
  return (
    <div
      style={style}
      className={
        "shrink-0 grid place-items-center rounded-full bg-[var(--color-sage-soft)] font-display " +
        className
      }
    >
      {initial}
    </div>
  );
}
