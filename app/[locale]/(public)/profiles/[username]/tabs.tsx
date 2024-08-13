interface Tab {
    label: string;
    component: React.ReactElement;
  }
  
  interface TabsProps {
    tabs: Tab[];
    activeTab: string;
  }
  
  export default function Tabs({ tabs, activeTab }: TabsProps) {
    return (
      <div>
        <div className="pb-4">
          {tabs.map((tab) => (
            <a
              key={tab.label}
              href={`?tab=${encodeURIComponent(tab.label)}`}
              className={`p-4 ${activeTab === tab.label ? 'border-b-2 border-blue-500' : ''}`}
            >
              {tab.label}
            </a>
          ))}
        </div>
        <div className="mt-4">
          {tabs.map((tab) =>
            activeTab === tab.label ? (
              <div key={tab.label}>
                {tab.component}
              </div>
            ) : null
          )}
        </div>
      </div>
    );
  }
  