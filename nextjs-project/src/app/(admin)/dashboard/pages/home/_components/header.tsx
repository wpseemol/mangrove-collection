interface HeaderProps {
     title: string;
     subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
     return (
          <div className="mb-8">
               <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {title}
               </h1>
               {subtitle && (
                    <p className="text-slate-600 dark:text-gray-400 mt-2">
                         {subtitle}
                    </p>
               )}
          </div>
     );
}
