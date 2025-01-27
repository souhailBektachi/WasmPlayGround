interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tabs = ({ tabs, activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="flex bg-gradient-to-r from-[#1a1a1a] to-[#252525] border-b border-[#2d2d2d] px-1 pt-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`
            group px-4 py-2 rounded-t text-sm transition-all duration-300 relative top-[1px] mr-1
            hover:bg-opacity-80 focus:outline-none focus:ring-1 focus:ring-blue-500/50
            ${activeTab === tab.id 
              ? 'bg-[#1e1e1e] text-gray-200 font-medium shadow-inner' 
              : 'bg-transparent text-gray-400 hover:bg-[#2d2d2d]'
            }
          `}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="relative z-10 flex items-center gap-2">
            {tab.label}
            <div className={`
              h-1 w-1 rounded-full transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-blue-500' 
                : 'bg-transparent group-hover:bg-gray-400'
              }
            `} />
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
