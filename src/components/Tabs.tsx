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
    <div style={{
      display: 'flex',
      backgroundColor: '#252526',
      borderBottom: '1px solid #333',
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === tab.id ? '#1e1e1e' : 'transparent',
            border: 'none',
            borderRight: '1px solid #333',
            color: activeTab === tab.id ? '#fff' : '#999',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === tab.id ? 500 : 400,
          }}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
