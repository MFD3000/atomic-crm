export const OakwoodProspectIndicator = ({
  isOakwoodProspect,
  billingCode,
}: {
  isOakwoodProspect?: boolean;
  billingCode?: string;
}) => {
  if (!isOakwoodProspect) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300">
      <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center">
        <span className="font-oswald text-white text-xs font-bold">51</span>
      </div>
      <div className="flex flex-col">
        <span className="font-oswald uppercase tracking-wide text-xs text-slate-900 font-semibold">
          Oakwood Prospect
        </span>
        {billingCode && (
          <span className="font-sans text-[10px] text-slate-600">
            Code: {billingCode}
          </span>
        )}
      </div>
    </div>
  );
};
