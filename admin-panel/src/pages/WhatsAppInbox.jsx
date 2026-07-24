import React, { useState } from 'react';

const WhatsAppInbox = () => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null); // null means showing list on mobile

  // Mock data for UI demonstration
  const conversations = [
    { id: 1, name: 'Giovanni Castañeda', lastMessage: 'Hola, ocupo un electricista.', time: '10:45 AM', unread: 2 },
    { id: 2, name: 'Carlos Slim', lastMessage: '¿Tienen servicio de plomería?', time: '09:20 AM', unread: 0 },
    { id: 3, name: 'Maria Felix', lastMessage: 'Gracias, los espero mañana.', time: 'Ayer', unread: 0 },
  ];

  const activeChat = conversations.find(c => c.id === (activeChatId || 1));

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 p-margin-desktop pt-0 max-w-container-max mx-auto">
      
      {/* Left Sidebar - Chat List (Hidden on mobile if a chat is active) */}
      <div className={`bg-surface border border-outline-variant w-full md:w-[350px] flex flex-col shrink-0 overflow-hidden ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-outline-variant bg-surface-container-low">
          <h2 className="font-headline-md text-primary mb-4">Messages</h2>
          <div className="flex items-center bg-surface-container border border-outline-variant rounded px-3 py-2">
            <span className="material-symbols-outlined text-[18px] text-outline">search</span>
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="bg-transparent border-none outline-none ml-2 font-body-md text-on-surface w-full text-[14px] placeholder:text-outline"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(chat => (
            <div 
              key={chat.id} 
              className={`flex gap-4 p-5 border-b border-outline-variant cursor-pointer transition-colors ${
                (activeChatId || 1) === chat.id 
                  ? 'bg-primary-container/10 border-l-4 border-l-brand-orange border-b-outline-variant' 
                  : 'hover:bg-surface-container-low border-l-4 border-l-transparent'
              }`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <div className="w-12 h-12 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
                {chat.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-label-md text-[14px] text-primary truncate">{chat.name}</h4>
                  <span className="text-[12px] text-on-surface-variant">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-body-md text-[14px] text-on-surface-variant truncate m-0">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="bg-brand-orange text-white text-[12px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area - Active Chat (Hidden on mobile if no chat is active) */}
      <div className={`bg-surface border border-outline-variant flex-1 flex flex-col overflow-hidden ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {/* Chat Header */}
        <div className="p-4 md:p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Back button for mobile */}
            <button 
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full flex items-center justify-center"
              onClick={() => setActiveChatId(null)}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {activeChat?.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-label-md text-[16px] text-primary">{activeChat?.name}</h3>
              <p className="font-body-md text-[12px] text-on-surface-variant">+52 664 318 8415</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-3 bg-surface border border-outline-variant px-4 py-2 rounded-full">
              <span className={`text-[14px] font-label-md flex items-center gap-1.5 transition-colors ${aiEnabled ? 'text-brand-orange' : 'text-outline'}`}>
                <span className="material-symbols-outlined text-[18px]">smart_toy</span> AI Active
              </span>
              
              <label className="relative inline-block w-11 h-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={aiEnabled} 
                  onChange={() => setAiEnabled(!aiEnabled)} 
                />
                <div className="w-11 h-6 bg-surface-variant border border-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-green-600 peer-checked:border-green-600"></div>
              </label>

              <span className={`text-[14px] font-label-md flex items-center gap-1.5 transition-colors ${!aiEnabled ? 'text-primary' : 'text-outline'}`}>
                <span className="material-symbols-outlined text-[18px]">person</span> Manual
              </span>
            </div>

            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors hidden sm:flex items-center justify-center">
              <span className="material-symbols-outlined">phone</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Mobile AI Toggle Banner (only visible on mobile) */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 bg-surface-container-low border-b border-outline-variant">
           <span className="text-[12px] font-label-md text-on-surface-variant">AI Assistant</span>
           <label className="relative inline-block w-9 h-5 cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={aiEnabled} 
                onChange={() => setAiEnabled(!aiEnabled)} 
              />
              <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border after:rounded-full after:h-[16px] after:w-[16px] after:transition-all peer-checked:bg-green-600"></div>
            </label>
        </div>

        {/* Messages History */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 bg-surface-container-lowest">
          <div className="flex flex-col self-start max-w-[85%] md:max-w-[70%]">
            <div className="px-4 py-3 bg-surface-container border border-outline-variant rounded-2xl rounded-bl-sm text-on-surface font-body-md text-[14px] md:text-[16px]">
              Hola, ocupo un electricista.
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 ml-1 font-body-md">10:42 AM</span>
          </div>
          
          <div className="flex flex-col self-end max-w-[85%] md:max-w-[70%]">
            <div className="px-4 py-3 bg-primary-container text-on-primary-container rounded-2xl rounded-br-sm font-body-md text-[14px] md:text-[16px] relative shadow-sm">
              ¡Hola Giovanni! Claro que sí, con gusto te ayudamos. ¿En qué código postal te encuentras para asignarte al electricista más cercano?
              <div className="flex items-center gap-1 text-[10px] font-label-md uppercase tracking-wider mt-2 opacity-80">
                <span className="material-symbols-outlined text-[14px]">smart_toy</span> Generated by AI
              </div>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 mr-1 self-end font-body-md">10:42 AM</span>
          </div>

          <div className="flex flex-col self-start max-w-[85%] md:max-w-[70%]">
            <div className="px-4 py-3 bg-surface-container border border-outline-variant rounded-2xl rounded-bl-sm text-on-surface font-body-md text-[14px] md:text-[16px]">
              22206
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 ml-1 font-body-md">10:45 AM</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-outline-variant flex items-center gap-3 md:gap-4 bg-surface">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <input 
            type="text" 
            placeholder={aiEnabled ? "AI is currently replying to this chat..." : "Type a message..."} 
            disabled={aiEnabled}
            className={`flex-1 bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-3 font-body-md text-[14px] md:text-[16px] outline-none transition-all ${
              aiEnabled ? 'opacity-70 cursor-not-allowed text-outline placeholder:text-outline' : 'text-on-surface focus:border-brand-orange focus:ring-1 focus:ring-brand-orange placeholder:text-outline'
            }`}
          />
          <button 
            className={`p-3 rounded-full flex items-center justify-center shrink-0 transition-all ${
              aiEnabled ? 'bg-surface-container text-outline cursor-not-allowed border border-outline-variant' : 'bg-brand-orange text-white hover:opacity-90'
            }`}
            disabled={aiEnabled}
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppInbox;
