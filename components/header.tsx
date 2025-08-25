type HeaderProps = {
  title: string;
  description: string;
};

export const Header = ({ title, description }: HeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
};
