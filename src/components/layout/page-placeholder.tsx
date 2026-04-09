type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">{description}</p>
        <p className="mt-1 text-xs text-gray-400">Modulo en construccion</p>
      </div>
    </div>
  );
}
