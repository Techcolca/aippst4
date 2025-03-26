import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Send } from "lucide-react";
import ChatInterface from "./chat-interface";

interface EmbeddableWidgetProps {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  themeColor?: string;
  assistantName?: string;
}

export default function EmbeddableWidget({
  apiKey,
  position = 'bottom-right',
  themeColor = '#3B82F6',
  assistantName = 'AIPI Assistant'
}: EmbeddableWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: '1.5rem', left: '1.5rem' };
      case 'top-right':
        return { top: '1.5rem', right: '1.5rem' };
      case 'top-left':
        return { top: '1.5rem', left: '1.5rem' };
      case 'bottom-right':
      default:
        return { bottom: '1.5rem', right: '1.5rem' };
    }
  };
  
  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  const positionStyles = getPositionStyles();
  
  return (
    <div 
      className="fixed z-50 flex flex-col" 
      style={positionStyles}
    >
      {isOpen && !isMinimized && (
        <div className="mb-4 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div 
            className="p-4 flex justify-between items-center text-white"
            style={{ backgroundColor: themeColor }}
          >
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke={themeColor} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">{assistantName}</p>
                <p className="text-xs opacity-75">Online</p>
              </div>
            </div>
            <div className="flex">
              <button 
                onClick={toggleMinimize}
                className="text-white hover:text-gray-200 focus:outline-none mr-2"
                aria-label="Minimize"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path>
                </svg>
              </button>
              <button 
                onClick={toggleWidget}
                className="text-white hover:text-gray-200 focus:outline-none"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <ChatInterface integrationId={0} />
        </div>
      )}
      
      {isOpen && isMinimized && (
        <div 
          className="mb-4 rounded-lg shadow-lg cursor-pointer p-3 text-white"
          style={{ backgroundColor: themeColor }}
          onClick={toggleMinimize}
        >
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center mr-2">
              <svg className="w-5 h-5" fill="none" stroke={themeColor} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <span>{assistantName}</span>
          </div>
        </div>
      )}
      
      <Button
        className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
        onClick={toggleWidget}
        style={{ backgroundColor: isOpen ? '#64748b' : themeColor }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}
