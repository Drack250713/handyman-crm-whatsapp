import React, { useState } from 'react';

const AISettings = () => {
  const [activeTab, setActiveTab] = useState('prompt');
  
  return (
    <div className="p-margin-desktop max-w-container-max mx-auto space-y-stack-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-2">AI Settings</h1>
          <p className="font-body-md text-on-surface-variant">Configure your assistant's behavior and integrations.</p>
        </div>
        <button className="px-6 py-3 bg-brand-orange text-white font-button uppercase tracking-wide flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[20px]">save</span>
          Deploy Configuration
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-gutter min-h-[600px]">
        {/* Tabs Sidebar */}
        <div className="bg-surface border border-outline-variant p-4 w-full md:w-64 shrink-0 h-fit flex flex-col gap-2">
          <button 
            className={`flex items-center gap-3 px-4 py-3 font-label-md transition-colors text-left rounded ${
              activeTab === 'prompt' 
                ? 'bg-primary-container text-on-primary-container' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
            onClick={() => setActiveTab('prompt')}
          >
            <span className="material-symbols-outlined text-[20px]">terminal</span>
            Persona & Logic
          </button>
          <button 
            className={`flex items-center gap-3 px-4 py-3 font-label-md transition-colors text-left rounded ${
              activeTab === 'business' 
                ? 'bg-primary-container text-on-primary-container' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
            onClick={() => setActiveTab('business')}
          >
            <span className="material-symbols-outlined text-[20px]">shield</span>
            Business Rules
          </button>
          <button 
            className={`flex items-center gap-3 px-4 py-3 font-label-md transition-colors text-left rounded ${
              activeTab === 'keys' 
                ? 'bg-primary-container text-on-primary-container' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
            onClick={() => setActiveTab('keys')}
          >
            <span className="material-symbols-outlined text-[20px]">key</span>
            API Keys
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-surface border border-outline-variant flex-1 p-stack-md flex flex-col">
          {activeTab === 'prompt' && (
            <div className="flex-1 flex flex-col animate-[fadeIn_0.3s_ease-in-out]">
              <h2 className="font-headline-md text-primary mb-2">System Prompt</h2>
              <p className="font-body-md text-on-surface-variant mb-6">
                This dictates exactly how the AI will respond to leads on WhatsApp. You can use markdown and variables.
              </p>
              
              <div className="flex-1 flex flex-col bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
                <textarea 
                  className="flex-1 w-full min-h-[400px] bg-transparent border-none p-6 text-on-surface font-mono text-[14px] leading-relaxed resize-none outline-none focus:ring-2 focus:ring-brand-orange/20 placeholder:text-outline"
                  defaultValue={`Eres el asistente virtual de la empresa Handyman Express...`}
                />
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="flex-1 flex flex-col animate-[fadeIn_0.3s_ease-in-out]">
              <h2 className="font-headline-md text-primary mb-2">Business Info</h2>
              <p className="font-body-md text-on-surface-variant mb-8">Configure the services, pricing, and operating hours the AI knows about.</p>
              
              <div className="flex flex-col gap-6 max-w-2xl">
                 <div>
                   <label className="block font-label-md text-on-surface-variant mb-2">Company Name</label>
                   <input className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-on-surface transition-colors focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange" type="text" placeholder="Company Name" defaultValue="Handyman Express" />
                 </div>
                 <div>
                   <label className="block font-label-md text-on-surface-variant mb-2">Services Provided</label>
                   <textarea className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-on-surface transition-colors focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange min-h-[150px] resize-y" placeholder="List of services provided..." defaultValue="Plumbing, Electrical, Carpentry..."></textarea>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="flex-1 flex flex-col animate-[fadeIn_0.3s_ease-in-out]">
              <h2 className="font-headline-md text-primary mb-2">API Keys</h2>
              <p className="font-body-md text-on-surface-variant mb-8">Manage your connected services credentials securely.</p>
              
              <div className="flex flex-col gap-6 max-w-xl">
                 <div>
                   <label className="block font-label-md text-on-surface-variant mb-2">Gemini API Key</label>
                   <input className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-on-surface transition-colors focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange" type="password" defaultValue="************************" />
                 </div>
                 <div>
                   <label className="block font-label-md text-on-surface-variant mb-2">WhatsApp Access Token</label>
                   <input className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-on-surface transition-colors focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange" type="password" defaultValue="************************" />
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISettings;
