'use client'

import { useState } from 'react'
import Conversations from '@/components/Conversations'
import SpamCheck from '@/components/SpamCheck'
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { Button } from "@/components/ui/button";
import { Palette } from 'lucide-react'

export default function HomePage() {
  const [tab, setTab] = useState<'conversations' | 'spam'>('conversations')
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);

  return (
    <div>
      
      <nav className="nav">
        <div className="customize_theme">
          <Button 
            onClick={() => setIsThemeCustomizerOpen(true)} 
            className="customize_theme p-2"
            title="Customize Theme"
          >
            <Palette className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="nav-center">
          <button onClick={() => setTab('conversations')} className={tab === 'conversations' ? 'font-bold' : ''}>
            Conversations
          </button>
          <button onClick={() => setTab('spam')} className={tab === 'spam' ? 'font-bold' : ''}>
            Spam Check
          </button>
        </div>
      </nav>

      <div>
        <div className={tab === 'conversations' ? 'block' : 'hidden'}>
          <Conversations />
        </div>
        <div className={tab === 'spam' ? 'block' : 'hidden'}>
          <SpamCheck />
        </div>
      </div>

      <div>
        <p className="console-title">Console</p>
        <div className="console-output" id='console-output'>
          <pre>
            {`Welcome to the AI-Powered Scam Email Detection and Engagement App!
            - Use the Conversations tab to view and manage your conversations.
            - Use the Spam Check tab to analyze and check for spam content.
            - Customize the theme using the theme customizer.
            `}
          </pre>
        </div>
      </div>

      {/* Theme Customizer */}
        <ThemeCustomizer 
          isOpen={isThemeCustomizerOpen} 
          onClose={() => setIsThemeCustomizerOpen(false)} 
        />
    </div>
  )
}
