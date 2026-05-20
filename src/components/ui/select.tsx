import React from 'react';

export function Select({ children, value, onValueChange }: any) {
  const options: any[] = [];
  const findItems = (node: any) => {
    if (!node) return;
    if (node.type === SelectItem) {
      options.push(node);
      return;
    }
    if (node.props && node.props.children) {
      React.Children.forEach(node.props.children, findItems);
    }
  };
  React.Children.forEach(children, findItems);

  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none pr-8 cursor-pointer"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.props.value}>
            {opt.props.children}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
}

export function SelectTrigger(_props: any) {
  return null;
}

export function SelectValue(_props: any) {
  return null;
}

export function SelectContent({ children }: any) {
  return <>{children}</>;
}

export function SelectItem({ value, children }: any) {
  return <option value={value}>{children}</option>;
}
