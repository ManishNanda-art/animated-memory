import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Upload, Database, LayoutDashboard, History, Sparkles, Send, 
  Plus, CheckCircle, AlertTriangle, HelpCircle, FileDown, LogIn, LogOut, 
  Layers, Check, Search, Trash2, Edit3, BookOpen, Clock, RefreshCw, ChevronRight, User2,
  Maximize2, Minimize2, ChevronLeft, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { User, RFPDocument, Requirement, Proposal, ProposalSection, ComplianceResult, KnowledgeDocument, ChatSession, ChatMessage, UserRole } from "./types";

function ThinkingIndicator() {
  const [step, setStep] = useState(0);
  const steps = [
    "Searching corporate fact book catalog database...",
    "Querying FAISS semantic vector collection...",
    "Retrieving compliance matrices & previous response templates...",
    "Formulating competitive zero-trust options...",
    "Comparing commercial subscriptions and tier volume discounts...",
    "Synthesizing detailed strategic advice..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col max-w-[90%] self-start bg-white/5 animate-pulse rounded-2xl p-4 border border-white/5 bg-[#0C0C0E]">
      <div className="flex items-center space-x-2 text-slate-400 font-mono text-[10px] select-none">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
        <span className="uppercase tracking-wider font-extrabold text-[#A1A1AA]">AI Companion is thinking...</span>
      </div>
      <div className="mt-2.5 text-xs text-slate-500 italic flex items-center gap-2">
        <div className="flex gap-1 shrink-0">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-[11px] text-slate-400 font-medium transition-all duration-300">{steps[step]}</span>
      </div>
    </div>
  );
}

export default function App() {
  // Authentication & session variables
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "u-1",
    email: "demo@proposal.ai",
    name: "Manish",
    role: UserRole.SALES_REP
  });

  const [authEmail, setAuthEmail] = useState("demo@proposal.ai");
  const [authPassword, setAuthPassword] = useState("demo");
  const [authName, setAuthName] = useState("");
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.SALES_REP);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"dashboard" | "upload-rfp" | "knowledge-base" | "workspace" | "history">("dashboard");

  // App core states
  const [rfps, setRfps] = useState<RFPDocument[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  
  // Workspace selections
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
  // Knowledge Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingKnowledge, setIsSearchingKnowledge] = useState(false);
  const [newIntelTitle, setNewIntelTitle] = useState("");
  const [newIntelCategory, setNewIntelCategory] = useState<KnowledgeDocument["category"]>("Product Catalog");
  const [newIntelContent, setNewIntelContent] = useState("");
  const [newIntelTags, setNewIntelTags] = useState("");
  const [intelSuccessMsg, setIntelSuccessMsg] = useState("");

  // RFP file upload input states
  const [rfpTitle, setRfpTitle] = useState("");
  const [rfpTextBody, setRfpTextBody] = useState("");
  const [rfpSuccessMsg, setRfpSuccessMsg] = useState("");
  const [isUploadingRfp, setIsUploadingRfp] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; base64: string; size: number }[]>([]);

  // AI workspace variables
  const [customPromptInstruction, setCustomPromptInstruction] = useState("");
  const [isGeneratingSection, setIsGeneratingSection] = useState(false);
  
  // Chat Companion states
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatMessage, setCurrentChatMessage] = useState("");
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);

  // Manual Section Editor values
  const [sectionEditorContent, setSectionEditorContent] = useState("");
  const [manualSavingSection, setManualSavingSection] = useState(false);
  const [manualSaveSuccessMsg, setManualSaveSuccessMsg] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveDone, setAutoSaveDone] = useState(false);

  // Panel size controls (minimizing, maximizing sidebars to clear clustered panels)
  const [aiPanelSize, setAiPanelSize] = useState<"minimized" | "standard" | "maximized">("standard");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);

  // State initialization flags
  const [isLoadingMainData, setIsLoadingMainData] = useState(true);

  // Chat auto scroll hook helper
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isSendingChatMessage]);

  // Fetch initial collections
  useEffect(() => {
    fetchInitialData();
  }, [currentUser]);

  const fetchInitialData = async () => {
    if (!currentUser) return;
    setIsLoadingMainData(true);
    try {
      // Fetch RFPs
      const rfpRes = await fetch("/api/rfp");
      const rfpData = await rfpRes.json();
      setRfps(rfpData);

      // Fetch Proposals
      const propRes = await fetch("/api/proposals/list");
      const propData = await propRes.json();
      setProposals(propData);
      
      if (propData.length > 0 && !selectedProposalId) {
        setSelectedProposalId(propData[0].id);
        if (propData[0].sections && propData[0].sections.length > 0) {
          setActiveSectionId(propData[0].sections[0].id);
          setSectionEditorContent(propData[0].sections[0].content);
        }
      }

      // Fetch Knowledge Base
      const kbRes = await fetch("/api/knowledge/list");
      const kbData = await kbRes.json();
      setKnowledgeDocs(kbData);

      // Fetch Chat Sessions
      const chatSessRes = await fetch("/api/chat/sessions");
      const chatSessData = await chatSessRes.json();
      setChatSessions(chatSessData);
      if (chatSessData.length > 0) {
        setActiveChatSessionId(chatSessData[0].id);
        fetchChatMessages(chatSessData[0].id);
      } else {
        // Auto-create initial default assistant helper session
        createChatSession("RFP Interactive Guidance Analyst");
      }
    } catch (e) {
      console.error("Error retrieving dataset:", e);
    } finally {
      setIsLoadingMainData(false);
    }
  };

  // Helper messages fetch
  const fetchChatMessages = async (sessId: string) => {
    try {
      const res = await fetch(`/api/chat/${sessId}/messages`);
      const data = await res.json();
      setChatMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger registration workflow
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword, name: authName, role: authRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed registration");
      
      // Auto log in
      setCurrentUser(data.user);
      setActiveTab("dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Credential registration error");
    }
  };

  // Trigger login workflow
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unauthorized login details");

      setCurrentUser(data.user);
      setActiveTab("dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Invalid authentication criteria");
    }
  };

  // File processing tools
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(e.target.files);
  };

  const processFiles = (filesList: FileList) => {
    const filesArray = Array.from(filesList);
    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.split(",")[1];
        setUploadedFiles(prev => {
          if (prev.some(f => f.name === file.name)) return prev;
          return [
            ...prev,
            {
              name: file.name,
              type: file.type,
              size: file.size,
              base64: base64Data
            }
          ];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  // Upload RFP action
  const handleRfpUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfpTitle && uploadedFiles.length === 0) {
      setRfpSuccessMsg("Please provide an RFP title with specifications or upload files.");
      return;
    }
    setIsUploadingRfp(true);
    setRfpSuccessMsg("");
    try {
      const res = await fetch("/api/rfp/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: rfpTitle, 
          rawText: rfpTextBody,
          files: uploadedFiles
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "RFP upload failed");

      // Set success feedback
      setRfpSuccessMsg(`RFP successfully indexed! Generated ID: ${data.rfpId}. Loaded ${data.requirementsCount} actionable requirements.`);
      setRfpTitle("");
      setRfpTextBody("");
      setUploadedFiles([]);

      // Refresh the RFP document arrays
      const refreshRes = await fetch("/api/rfp");
      const refreshData = await refreshRes.json();
      setRfps(refreshData);

      // Auto-compile a fresh matching Response Proposal draft seamlessly
      await handleCreateProposal(data.rfpId, `Proposal Response - ${data.rfpId.toUpperCase()}`);
    } catch (err: any) {
      setRfpSuccessMsg(`Analysis Error: ${err.message}`);
    } finally {
      setIsUploadingRfp(false);
    }
  };

  // Quick Action: Create proposal response workspace
  const handleCreateProposal = async (rfpId: string, customTitle?: string) => {
    try {
      const res = await fetch("/api/proposals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfpId, title: customTitle })
      });
      
      const contentType = res.headers.get("Content-Type") || res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.proposal) {
          // Prepend to native state
          setProposals(prev => [data.proposal, ...prev]);
          setSelectedProposalId(data.proposal.id);
          if (data.proposal.sections && data.proposal.sections.length > 0) {
            setActiveSectionId(data.proposal.sections[0].id);
            setSectionEditorContent(data.proposal.sections[0].content);
          }
          // Redirect right away to the Workspace view
          setActiveTab("workspace");
          return;
        }
      }
      
      console.warn("Server proposal creation returned non-JSON or error. Falling back to local composition.");
      triggerLocalProposalFallback(rfpId, customTitle);
    } catch (e) {
      console.error("Failed executing proposal initialization, falling back to local fallback:", e);
      triggerLocalProposalFallback(rfpId, customTitle);
    }
  };

  const triggerLocalProposalFallback = (rfpId: string, customTitle?: string) => {
    const matchedRfp = rfps.find(r => r.id === rfpId);
    const rfpTitle = matchedRfp ? matchedRfp.title : `RFP #${rfpId}`;
    const proposalId = `p-local-${Date.now()}`;

    const sectionTypes: ProposalSection["type"][] = [
      "Cover Page",
      "Executive Summary",
      "Understanding of Requirements",
      "Proposed Solution",
      "Compliance Matrix",
      "Pricing & Commercial Terms",
      "Implementation Plan",
      "Team & Credentials",
      "Appendices"
    ];

    const sections: ProposalSection[] = sectionTypes.map((type, idx) => ({
      id: `sec-${proposalId}-${idx}`,
      proposalId,
      sectionNumber: `${idx + 1}`,
      title: type,
      content: `[Click Generate on Companion context menu to build out complete ${type} using advanced corporate RAG intelligence.]`,
      type,
      status: "pending"
    }));

    const fallbackProposal: Proposal = {
      id: proposalId,
      title: customTitle || `Response to ${rfpTitle}`,
      rfpId,
      rfpTitle,
      status: "draft",
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      sections,
      complianceResults: [],
      pricingSummary: {
        oneTimeFee: 25000,
        recurringFee: 2400,
        billingCycle: "Yearly",
        currency: "USD"
      }
    };

    setProposals(prev => [fallbackProposal, ...prev]);
    setSelectedProposalId(proposalId);
    setActiveSectionId(sections[0].id);
    setSectionEditorContent(sections[0].content);
    setActiveTab("workspace");
  };

  // Create workspace chat conversation session
  const createChatSession = async (titleStr: string, matchedProposalId?: string) => {
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: matchedProposalId, title: titleStr })
      });
      const data = await res.json();
      if (res.ok) {
        setChatSessions(prev => [data, ...prev]);
        setActiveChatSessionId(data.id);
        setChatMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Core companion chat communication endpoint
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChatMessage.trim() || !activeChatSessionId) return;

    const userText = currentChatMessage;
    setCurrentChatMessage("");
    setIsSendingChatMessage(true);

    // Save transient message to prevent waiting latency display
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: activeChatSessionId,
      sender: "user",
      content: userText,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/chat/${activeChatSessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userText,
          proposalId: selectedProposalId
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Swap out list with real saved documents
        setChatMessages(prev => 
          prev.filter(m => m.id !== tempUserMsg.id).concat(data.userMessage, data.assistantMessage)
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  // Add customized Intel to Knowledge Base (FAISS indexer)
  const handleAddIntelDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntelTitle || !newIntelContent) return;
    setIntelSuccessMsg("");
    try {
      const tagsArray = newIntelTags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newIntelTitle,
          category: newIntelCategory,
          content: newIntelContent,
          tags: tagsArray
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIntelSuccessMsg(`Intel piece "${newIntelTitle}" is securely indexed in the vector FAISS storage.`);
        setNewIntelTitle("");
        setNewIntelContent("");
        setNewIntelTags("");
        
        // Refresh knowledge list
        const propRes = await fetch("/api/knowledge/list");
        const listData = await propRes.json();
        setKnowledgeDocs(listData);
      }
    } catch (e: any) {
      setIntelSuccessMsg(`Failure adding intelligence: ${e.message}`);
    }
  };

  // Query vector DB semantically using user strings
  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchingKnowledge(true);
    try {
      const res = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingKnowledge(false);
    }
  };

  // Generate selected proposal section using advanced server-side grounding parameters
  const handleGenerateSectionAI = async () => {
    if (!selectedProposalId || !activeSectionId) return;
    setIsGeneratingSection(true);
    try {
      const res = await fetch(`/api/proposals/${selectedProposalId}/generate-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: activeSectionId,
          customInstruction: customPromptInstruction
        })
      });
      const data = await res.json();
      if (res.ok && data.section) {
        // Update proposal list in-state
        setProposals(prev => prev.map(p => {
          if (p.id === selectedProposalId) {
            return {
              ...p,
              sections: p.sections.map(s => s.id === activeSectionId ? data.section : s),
              complianceResults: data.complianceResults || p.complianceResults
            };
          }
          return p;
        }));
        
        // Update current editor state immediately
        setSectionEditorContent(data.section.content);
        setCustomPromptInstruction("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSection(false);
    }
  };

  // Manual Editor: Update content and save to backend
  const handleSaveSectionManual = async () => {
    if (!selectedProposalId || !activeSectionId) return;
    setManualSavingSection(true);
    setManualSaveSuccessMsg(false);
    try {
      const res = await fetch(`/api/proposals/${selectedProposalId}/sections/${activeSectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: sectionEditorContent,
          status: "completed"
        })
      });
      if (res.ok) {
        setProposals(prev => prev.map(p => {
          if (p.id === selectedProposalId) {
            return {
              ...p,
              sections: p.sections.map(s => s.id === activeSectionId ? { ...s, content: sectionEditorContent, status: "completed" } : s)
            };
          }
          return p;
        }));
        setManualSaveSuccessMsg(true);
        setTimeout(() => setManualSaveSuccessMsg(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setManualSavingSection(false);
    }
  };

  // Live Auto-Save to backend: triggers 750ms after user stops typing
  useEffect(() => {
    if (!selectedProposalId || !activeSectionId || !sectionEditorContent) return;

    // Set auto-saving indicator
    setIsAutoSaving(true);
    setAutoSaveDone(false);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/proposals/${selectedProposalId}/sections/${activeSectionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: sectionEditorContent,
            status: "completed"
          })
        });

        if (res.ok) {
          setProposals(prev => prev.map(p => {
            if (p.id === selectedProposalId) {
              return {
                ...p,
                sections: p.sections.map(s => s.id === activeSectionId ? { ...s, content: sectionEditorContent, status: "completed" } : s)
              };
            }
            return p;
          }));
          setAutoSaveDone(true);
        }
      } catch (err) {
        console.error("Live save error:", err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 750);

    return () => {
      clearTimeout(delayDebounceFn);
      setIsAutoSaving(false);
    };
  }, [sectionEditorContent, selectedProposalId, activeSectionId]);

  // Handle selected proposal switch in workspace state
  const selectWorkspaceProposal = (pId: string) => {
    setSelectedProposalId(pId);
    const selectedP = proposals.find(p => p.id === pId);
    if (selectedP && selectedP.sections && selectedP.sections.length > 0) {
      // Pick first section
      const firstSec = selectedP.sections[0];
      setActiveSectionId(firstSec.id);
      setSectionEditorContent(firstSec.content);
    }
  };

  // Handle selected section switch inside the active selected proposal
  const handleSelectSection = (s: ProposalSection) => {
    setActiveSectionId(s.id);
    setSectionEditorContent(s.content);
  };

  // Get active proposal reference safely
  const activeProposal = proposals.find(p => p.id === selectedProposalId) || proposals[0];

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-200 font-sans flex flex-col selection:bg-blue-600/30 selection:text-white">
      
      {/* Header Navigation */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-white flex items-center gap-2">
              ProposalAI
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO RAG
              </span>
            </span>
          </div>
          <div className="h-4 w-[1px] bg-white/20 mx-2"></div>
          
          {/* Main Tabs */}
          <nav className="flex items-center gap-1">
            <button 
              onClick={() => { setActiveTab("dashboard"); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "dashboard" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 inline mr-1" />
              Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab("upload-rfp"); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "upload-rfp" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              <Upload className="w-3.5 h-3.5 inline mr-1" />
              Analyze RFP
            </button>
            <button 
              onClick={() => { setActiveTab("workspace"); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "workspace" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              Response Workspace
            </button>
            <button 
              onClick={() => { setActiveTab("knowledge-base"); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "knowledge-base" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              <Database className="w-3.5 h-3.5 inline mr-1" />
              Knowledge Base (FAISS)
            </button>
            <button 
              onClick={() => { setActiveTab("history"); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "history" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              <History className="w-3.5 h-3.5 inline mr-1" />
              Proposal Archives
            </button>
          </nav>
        </div>

        {/* User Profile / Auth Area */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-white/5 pl-2 pr-3 py-1 rounded-full border border-white/10">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                {currentUser.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-white leading-none">{currentUser.name}</p>
                <p className="text-[9px] text-[#A1A1AA] mt-0.5 leading-none">{currentUser.role}</p>
              </div>
              <button 
                onClick={() => { setCurrentUser(null); }}
                className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Demo Mode</span>
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        
        {/* If user logged out - Display Auth Splash */}
        {!currentUser ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-radial from-[#0C0C0E] to-[#040405]">
            <div className="max-w-md w-full bg-[#0C0CE]/80 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white mx-auto shadow-lg shadow-blue-500/20 mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Access proposalAI Portal</h1>
                <p className="text-xs text-slate-400 mt-2">Enterprise-grade sales RAG assistance with dynamic requirements extraction parser.</p>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Corporate Email</label>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    placeholder="sarah.jenkins@proposal.ai"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Secure Password</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Enter Workspace
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setCurrentUser({
                        id: "u-1",
                        email: "coordinator@proposal.ai",
                        name: "Manish",
                        role: UserRole.SALES_REP
                      });
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg py-2.5 text-xs font-medium transition-colors"
                  >
                    Use Quick Demo
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-white/5 pt-4 text-center">
                <p className="text-[10px] text-slate-500">
                  Secured by local micro-credentials and sandbox-isolated token indexes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
                
                {/* Elegant Welcome Banner */}
                <div className="relative p-8 rounded-2xl bg-[#0C0C0E] border border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                  <div className="max-w-2xl">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                      Intelligence Advisory Engine Active
                    </span>
                    <h1 className="text-3xl font-bold text-white tracking-tight mt-4">
                      Welcome Back, {currentUser.name}!
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      Analyze strict requirements, auto-generate complex compliance matrices, structure pricing models, and design technical diagrams in seconds using local semantic RAG workflows.
                    </p>
                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => setActiveTab("upload-rfp")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Analyze New RFP Document
                      </button>
                      <button 
                        onClick={() => setActiveTab("workspace")}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Launch Active Workspace
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bento Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-[#0C0C0E] p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400 font-medium">Segmented RFPs</span>
                      <span className="p-1 px-1.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-mono font-bold">Processed</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-3xl font-bold text-white">{rfps.length}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Automatic requirements isolation completed.</p>
                    </div>
                  </div>

                  <div className="bg-[#0C0C0E] p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400 font-medium">Bid Drafts Managed</span>
                      <span className="p-1 px-1.5 rounded bg-green-500/10 text-green-400 text-[9px] font-mono font-bold">FAISS Synthesized</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-3xl font-bold text-white">{proposals.length}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Ready with 100% compliance templates.</p>
                    </div>
                  </div>

                  <div className="bg-[#0C0C0E] p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400 font-medium">Compliance Check Rate</span>
                      <span className="p-1 px-1.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold">Uptime Validated</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-3xl font-bold text-white">100%</h3>
                      <p className="text-[10px] text-slate-500 mt-1">No outstanding security gaps detected.</p>
                    </div>
                  </div>

                  <div className="bg-[#0C0C0E] p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400 font-medium font-mono">FAISS Knowledge Chunks</span>
                      <span className="p-1 px-1.5 rounded bg-purple-500/10 text-purple-400 text-[9px] font-mono font-bold">Semantic</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-3xl font-bold text-white">{knowledgeDocs.length}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Previous responses & templates indexed.</p>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Rows */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Recent proposals & files */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0C0C0E] rounded-xl border border-white/5 p-6 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          Recent Proposal Responses
                        </h2>
                        <button 
                          onClick={() => { setActiveTab("history"); }}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                          View Archives
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {proposals.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-xs text-slate-500 text-center">No compiled proposals found. Get started by uploading an RFP!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {proposals.slice(0, 3).map((prop) => (
                            <div key={prop.id} className="py-3 flex justify-between items-center group first:pt-0 last:pb-0">
                              <div className="space-y-1">
                                <h3 className="text-xs font-medium text-white group-hover:text-blue-400 transition-colors">{prop.title}</h3>
                                <p className="text-[10px] text-slate-400">{prop.rfpTitle}</p>
                                <div className="flex items-center gap-3 text-[9px] text-slate-500">
                                  <span>Modified {new Date(prop.lastModified).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span>{prop.sections.length} Core Sections</span>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-semibold font-mono">SLA 99.99% Met</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedProposalId(prop.id);
                                    if (prop.sections && prop.sections.length > 0) {
                                      setActiveSectionId(prop.sections[0].id);
                                      setSectionEditorContent(prop.sections[0].content);
                                    }
                                    setActiveTab("workspace");
                                  }}
                                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-[10px] font-medium border border-white/5 transition-all text-white cursor-pointer"
                                >
                                  Open Workspace
                                </button>
                                <a 
                                  href={`/api/export/${prop.id}/pdf`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-md text-[10px]"
                                  title="Export to PDF"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick overview of segmented requirements */}
                    <div className="bg-[#0C0C0E] rounded-xl border border-white/5 p-6">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          Consolidated RFP Documents List
                        </h2>
                        <span className="text-[10px] text-slate-400 font-mono">Real-time status</span>
                      </div>

                      {rfps.length === 0 ? (
                        <p className="text-xs text-slate-500">No raw RFPs uploaded. Switch to "Analyze RFP" tab to upload your first document.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {rfps.slice(0, 4).map((rfp) => (
                            <div key={rfp.id} className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-2">
                              <p className="text-xs font-semibold text-white truncate">{rfp.title}</p>
                              <div className="flex justify-between text-[10px] text-slate-400">
                                <span>Deadline: {rfp.deadline || "Pending"}</span>
                                <span>Size: {rfp.fileSize}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px]">
                                <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  {rfp.mandatoryRequirementsCount} requirements
                                </span>
                                <button 
                                  onClick={() => handleCreateProposal(rfp.id, `Bid Response - ${rfp.title.split(":")[0]}`)}
                                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                >
                                  New Bid
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Key Knowledge bases and FAISS insight summary */}
                  <div className="space-y-6">
                    <div className="bg-[#0C0C0E] rounded-xl border border-white/5 p-6 space-y-4">
                      <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                        <Database className="w-4 h-4 text-purple-500" />
                        FAISS Embedded Libraries
                      </h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        These pre-seeded product catalogs, standard subscription pricing tables, SLA guarantees, and deployment pipelines are converted into multi-dimensional vectors on server launch, ready to ground your AI RAG generations.
                      </p>
                      
                      <div className="space-y-2.5">
                        {knowledgeDocs.slice(0, 4).map((doc) => (
                          <div key={doc.id} className="p-2.5 rounded bg-black/30 border border-white/5 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">
                                {doc.category}
                              </span>
                              <span className="text-[9px] text-[#A1A1AA] font-mono">
                                768 Dimensions
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-white truncate mt-1">{doc.title}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{doc.content}</p>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => setActiveTab("knowledge-base")}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-white transition-all cursor-pointer"
                      >
                        Manage Knowledge Bases
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB: UPLOAD RFP */}
            {activeTab === "upload-rfp" && (
              <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">RFP Requirements Extraction</h1>
                  <p className="text-sm text-[#A1A1AA]">Submit request documents or copy proposal text. Gemini will isolate target deadlines, evaluate performance matrices, and generate structured categories.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Form */}
                  <div className="lg:col-span-1 bg-[#0C0C0E] border border-white/5 p-6 rounded-xl space-y-4">
                    <form onSubmit={handleRfpUpload} className="space-y-4">
                      {/* Drag & Drop File Zone */}
                      <div className="border border-dashed border-white/20 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer bg-black/20 hover:bg-black/30 transition-all relative group">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.docx,.doc,.txt"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 rounded-full bg-white/5 group-hover:bg-blue-600/10 text-slate-400 group-hover:text-blue-400 transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">Drag & Drop RFP files here, or click to browse</p>
                            <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOC, DOCX, and TXT formats simultaneously</p>
                          </div>
                        </div>
                      </div>

                      {/* Uploaded Files Selection View */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2 bg-black/30 border border-white/10 p-4 rounded-lg">
                          <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              Selected Files ({uploadedFiles.length})
                            </span>
                            <button 
                              type="button" 
                              onClick={() => setUploadedFiles([])}
                              className="text-[10px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {uploadedFiles.map((file) => (
                              <div key={file.name} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-xs text-slate-300">
                                <FileText className="w-3.5 h-3.5 text-blue-400" />
                                <span className="max-w-[120px] truncate">{file.name}</span>
                                <span className="text-[9px] text-slate-500 font-mono">({Math.ceil(file.size / 1024)} KB)</span>
                                <button
                                  type="button"
                                  onClick={() => removeUploadedFile(file.name)}
                                  className="p-0.5 hover:bg-white/10 rounded text-slate-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                                  title="Remove selection"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 py-2">
                        <div className="h-[1px] bg-white/10 flex-1"></div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Or submit manually</span>
                        <div className="h-[1px] bg-white/10 flex-1"></div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          RFP Document Reference Name {uploadedFiles.length > 0 && "(Optional)"}
                        </label>
                        <input 
                          type="text" 
                          required={uploadedFiles.length === 0}
                          value={rfpTitle}
                          onChange={(e) => setRfpTitle(e.target.value)}
                          placeholder={uploadedFiles.length > 0 ? "Defaults to selected file names if empty..." : "e.g. RFP-EU-2026: Financial Governance Gateway Core"}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          RFC specifications or raw RFP Body Text {uploadedFiles.length > 0 && "(Optional)"}
                        </label>
                        <textarea 
                          required={uploadedFiles.length === 0}
                          rows={8}
                          value={rfpTextBody}
                          onChange={(e) => setRfpTextBody(e.target.value)}
                          placeholder={uploadedFiles.length > 0 ? "You can paste additional context here or leave empty..." : "Copy and paste RFP specification text here... For example: 'Section 3.2: Vendor must demonstrate integration with SAML 2.0 and ensure maximum response service latency below 250ms with 99.99% system uptime guarantees... Our target completion and delivery schedule is set for September 30, 2026.'"}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none font-mono"
                        ></textarea>
                      </div>

                      {rfpSuccessMsg && (
                        <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-xs leading-relaxed text-blue-300">
                          {rfpSuccessMsg}
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={isUploadingRfp}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {isUploadingRfp ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Executing Intelligent Requirement Parsing Extraction...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Trigger Requirement Parser & Build Proposal Response
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Dynamic AI Companion Chat Sidebar */}
                  <div className="lg:col-span-1 flex flex-col space-y-4">
                    
                    {/* Active Interactive Advisor Card */}
                    <div className="bg-[#0C0C0E] border border-white/10 rounded-xl flex flex-col h-[620px] overflow-hidden">
                      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#09090B]">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">RFP Expert Companion</h3>
                        </div>
                        <button 
                          type="button"
                          onClick={() => createChatSession("RFP Interactive Guidance - " + new Date().toLocaleDateString())}
                          className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                          title="New chat session"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Chat Message List */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-left">
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-6">
                            <Sparkles className="w-8 h-8 text-blue-500/30 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-semibold">Ready to assist!</p>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">Ask me to analyze compliance risks, compare product approaches, or sketch a high-level solution.</p>
                          </div>
                        ) : (
                          chatMessages.map((msg) => (
                            <div 
                              key={msg.id} 
                              className={`flex flex-col max-w-[90%] ${msg.sender === "user" ? "self-end ml-auto" : "self-start bg-white/5"}`}
                            >
                              <div className={`p-3 border ${msg.sender === "user" ? "bg-blue-600/10 text-blue-100 border-blue-500/20 rounded-2xl rounded-br-none" : "bg-[#111113] text-slate-300 border-white/5 rounded-2xl rounded-bl-none"}`}>
                                {msg.sender === "user" ? (
                                  <p className="text-xs leading-relaxed text-left whitespace-pre-line">{msg.content}</p>
                                ) : (
                                  <div className="text-xs text-left leading-relaxed">
                                    <Markdown
                                      components={{
                                        h1: ({node, ...props}) => <h1 className="text-sm font-bold mt-3 mb-1 text-white border-b border-white/5 pb-1" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-xs font-bold mt-2.5 mb-1 text-blue-400" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xs font-semibold mt-2 mb-0.5 text-white" {...props} />,
                                        p: ({node, ...props}) => <p className="text-xs text-slate-300 leading-relaxed mb-1.5" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-2 text-slate-300" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 mb-2 text-slate-300" {...props} />,
                                        li: ({node, ...props}) => <li className="text-xs text-slate-300" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-semibold text-white text-xs" {...props} />,
                                        code: ({node, ...props}) => <code className="bg-black/40 px-1 py-0.5 rounded text-[11px] font-mono text-pink-400" {...props} />
                                      }}
                                    >
                                      {msg.content}
                                    </Markdown>
                                  </div>
                                )}
                                
                                {msg.referenceSources && msg.referenceSources.length > 0 && (
                                  <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-col gap-1 text-left">
                                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-400 font-mono">Index Grounding:</span>
                                    {msg.referenceSources.slice(0, 2).map((source, sIdx) => (
                                      <span key={sIdx} className="text-[9px] text-[#A1A1AA] font-mono truncate block">
                                        • {source}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-500 mt-1 self-end font-mono">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                        {isSendingChatMessage && (
                          <div className="pt-2 flex flex-col space-y-2">
                            <ThinkingIndicator />
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Input Selector Box */}
                      <div className="p-3 border-t border-white/5 bg-[#09090B]">
                        <form onSubmit={sendChatMessage} className="relative">
                          <textarea 
                            placeholder="Ask the RFP Expert Companion..." 
                            rows={3}
                            value={currentChatMessage}
                            onChange={(e) => setCurrentChatMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendChatMessage(e);
                              }
                            }}
                            className="w-full bg-[#111113] border border-white/10 rounded-xl p-3 inline-block pr-12 pb-10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                          ></textarea>
                          
                          <div className="absolute bottom-5 left-3 flex gap-1.5 flex-wrap">
                            <button 
                              type="button"
                              onClick={() => {
                                setCurrentChatMessage("What are multiple competitive approaches of varying timeline and cost that we can present to address are SLAs, high-availability, and SAML gateway requests?");
                              }}
                              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[9px] font-mono font-medium transition-colors cursor-pointer"
                              title="Query strategic directions"
                            >
                              Explore Approaches
                            </button>
                          </div>

                          <button 
                            type="submit"
                            disabled={isSendingChatMessage || !currentChatMessage.trim()}
                            className="absolute bottom-5 right-3 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            {isSendingChatMessage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Extraction Protocols Guide */}
                    <div className="bg-[#0C0C0E]/50 border border-white/5 p-4 rounded-xl text-left">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Protocol Highlights</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        After the text of requirements parsing executes, past performance files indexed in our FAISS vector store are aligned instantly to propose bulleted bids with correct operational metrics.
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* TAB: KNOWLEDGE BASE */}
            {activeTab === "knowledge-base" && (
              <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">Semantic Knowledge Base</h1>
                  <p className="text-sm text-[#A1A1AA]">Manage previous response documents and product specs. Simulate local FAISS index updates instantly to enrich AI answers and RAG responses.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* FAISS Semantic Query Panel */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0C0C0E] border border-white/5 p-6 rounded-xl space-y-4">
                      <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                        <Search className="w-4 h-4 text-blue-500" />
                        Test Vector semantic Similarity (Simulated FAISS Search)
                      </h2>

                      <form onSubmit={handleSemanticSearch} className="flex gap-2 bg-black/40 border border-white/10 rounded-lg p-1.5 focus-within:border-blue-500/50 transition-all">
                        <input 
                          type="text" 
                          required
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="State query e.g. 'Active Directory SAML dual-shield latency support'"
                          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                        />
                        <button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Semantic Query
                        </button>
                      </form>

                      {isSearchingKnowledge ? (
                        <div className="flex justify-center py-6">
                          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                        </div>
                      ) : (
                        searchResults.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <p className="text-[10px] text-slate-500 font-mono">Retrieved top results with vector similarity score:</p>
                            {searchResults.map((res, index) => (
                              <div key={res.id || index} className="p-3 bg-blue-600/5 border border-blue-500/20 rounded-lg space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-semibold text-white">{res.title}</span>
                                  <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                    Sim: {Math.round(res.score * 100)}%
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">{res.content}</p>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>

                    {/* View all Indexed Documents */}
                    <div className="bg-[#0C0C0E] border border-white/5 p-6 rounded-xl space-y-4">
                      <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                        <Database className="w-4 h-4 text-purple-500" />
                        Indexed Intel Collections ({knowledgeDocs.length})
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {knowledgeDocs.map((doc) => (
                          <div key={doc.id} className="p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-purple-500/10 text-purple-400">
                                  {doc.category}
                                </span>
                                <span className="text-[9px] text-[#A1A1AA]">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-xs font-bold text-white leading-snug">{doc.title}</h3>
                              <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-4 leading-relaxed font-mono">{doc.content}</p>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-white/5">
                              {doc.tags?.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add Intelligence Form Panel */}
                  <div className="bg-[#0C0C0E] border border-white/5 p-6 rounded-xl h-fit space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-sm font-semibold text-white">Add Intel Material</h2>
                      <p className="text-xs text-[#A1A1AA]">Submit specs, SLA guidelines, or price sheets. They are real-time vector embedded inside FAISS database structures instantly.</p>
                    </div>

                    <form onSubmit={handleAddIntelDoc} className="space-y-4 pt-2">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Intel Document Title</label>
                        <input 
                          type="text" 
                          required
                          value={newIntelTitle}
                          onChange={(e) => setNewIntelTitle(e.target.value)}
                          placeholder="e.g. Gold Tier SLA Response Time Policy v2"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Intel Categorization</label>
                        <select 
                          value={newIntelCategory}
                          onChange={(e) => setNewIntelCategory(e.target.value as any)}
                          className="w-full bg-black hover:bg-black/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        >
                          <option value="Previous Proposals">Previous Proposals</option>
                          <option value="Product Catalog">Product Catalog</option>
                          <option value="Pricing Template">Pricing Template</option>
                          <option value="FAQ">FAQ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Relevant Tags (comma separated)</label>
                        <input 
                          type="text" 
                          value={newIntelTags}
                          onChange={(e) => setNewIntelTags(e.target.value)}
                          placeholder="SLA, Gold Plan, Technical, High Availability"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Intel Content Block</label>
                        <textarea 
                          required
                          rows={6}
                          value={newIntelContent}
                          onChange={(e) => setNewIntelContent(e.target.value)}
                          placeholder="Our secure cloud system guarantees maximum sub-milliseconds response times under typical user volumes. Active cluster load balancer delivers automatic failover across redundant gateways with 99.995% response guarantees."
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none font-sans leading-relaxed"
                        ></textarea>
                      </div>

                      {intelSuccessMsg && (
                        <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded text-[11px] text-blue-300">
                          {intelSuccessMsg}
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Submit & Index into FAISS Storage
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: WORKSPACE (PANELS STRUCTURE EXTREMELY ALIGNED TO REQUIREMENTS) */}
            {activeTab === "workspace" && (
              <div className="flex-1 flex overflow-hidden min-h-0 bg-[#09090B]">
                
                {/* 1. LEFT PANEL: Requirements Checklists & Criteria */}
                {!leftPanelCollapsed && (
                  <aside className="w-[280px] border-r border-white/10 bg-[#0C0C0E] flex flex-col shrink-0 min-h-0 transition-all duration-300">
                    <div className="p-4 border-b border-white/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Proposal Switcher</h3>
                      </div>
                      
                      <select 
                        value={selectedProposalId || ""}
                        onChange={(e) => selectWorkspaceProposal(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
                      >
                        {proposals.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">RFP Requirements Checklist</h3>
                    </div>

                    {/* Requirements List container */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2">
                      {activeProposal?.complianceResults?.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">No compliance requirements available.</p>
                      ) : (
                        activeProposal?.complianceResults?.map((c) => (
                          <div 
                            key={c.id} 
                            className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1.5 text-left hover:bg-white/10 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono font-bold">
                                {c.requirementCode}
                              </span>
                              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${c.status === "Compliant" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                                {c.status}
                              </span>
                            </div>
                            
                            <p className="text-[11px] text-slate-300 leading-normal line-clamp-3">{c.requirementText}</p>
                            <p className="text-[9px] text-[#A1A1AA] font-mono leading-relaxed line-clamp-2 italic border-l border-white/15 pl-1.5">
                              Response Excerpt: "{c.responseExcerpt}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Evaluation Criteria Progress metric */}
                    <div className="p-4 border-t border-white/10 bg-black/20">
                      <div className="flex justify-between text-xs mb-2 text-slate-400">
                        <span>Gateway Compliance</span>
                        <span className="font-mono font-semibold">100% Met</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                      </div>
                    </div>
                  </aside>
                )}

                {/* 2. CENTER PANEL: Proposal Editor & Live Sections */}
                <section className="flex-1 bg-[#09090B] flex flex-col overflow-hidden min-h-0">
                  
                  {/* Selected proposal workspace control bar */}
                  <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 bg-black/40">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                        className={`px-2.5 py-1 rounded border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${leftPanelCollapsed ? "bg-blue-600/10 text-blue-400 border-blue-500/30" : "bg-white/5 text-slate-400 hover:text-white border-white/10 hover:border-white/20"}`}
                        title={leftPanelCollapsed ? "Show Requirements Checklist Sidebar" : "Hide Requirements Checklist Sidebar"}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{leftPanelCollapsed ? "Show Checklist" : "Hide Checklist"}</span>
                      </button>

                      <div className="w-px h-4 bg-white/10" />

                      <span className="text-xs font-semibold text-slate-300">
                        Section Workspace: <span className="text-white font-bold">{activeProposal?.title}</span>
                      </span>
                    </div>

                    {/* Controls alignment panel */}
                    <div className="flex items-center gap-3">
                      {/* PDF Export trigger */}
                      <a 
                        href={`/api/export/${selectedProposalId}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer text-decoration-none"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Export Proposal to PDF</span>
                      </a>

                      <div className="w-px h-4 bg-white/10" />

                      {/* Right AI Companion Size Control */}
                      <div className="flex items-center p-0.5 bg-zinc-900 border border-white/10 rounded-lg">
                        <button
                          onClick={() => setAiPanelSize("minimized")}
                          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${aiPanelSize === "minimized" ? "bg-white/10 text-white font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
                          title="Minimize AI Agent (Hide completely)"
                        >
                          <Minimize2 className="w-3 h-3 text-amber-500" />
                          <span>Hide AI Agent</span>
                        </button>
                        <button
                          onClick={() => setAiPanelSize("standard")}
                          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${aiPanelSize === "standard" ? "bg-white/10 text-white font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
                          title="Restore Standard AI Sidebar"
                        >
                          <Layers className="w-3 h-3 text-blue-400" />
                          <span>Standard Sidebar</span>
                        </button>
                        <button
                          onClick={() => setAiPanelSize("maximized")}
                          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${aiPanelSize === "maximized" ? "bg-white/10 text-white font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
                          title="Maximize AI Agent (Wider perspective)"
                        >
                          <Maximize2 className="w-3 h-3 text-green-400" />
                          <span>Maximize AI</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex overflow-hidden min-h-0">
                    
                    {/* Sections Sidebar (Left navigation of sections 1-9) */}
                    <div className="w-[200px] border-r border-white/10 bg-[#0A0A0C] flex flex-col overflow-y-auto">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 p-3 pt-4 inline-block">MANDATORY SECTIONS</span>
                      {activeProposal?.sections?.map((sec) => (
                        <button
                          key={sec.id}
                          onClick={() => handleSelectSection(sec)}
                          className={`p-3.5 text-left text-xs font-medium border-b border-white/5 transition-all outline-none flex justify-between items-center ${activeSectionId === sec.id ? "bg-white/5 text-white border-l-2 border-l-blue-500" : "text-[#A1A1AA] hover:bg-white/5 hover:text-white"}`}
                        >
                          <span className="truncate">{sec.sectionNumber}. {sec.title}</span>
                          {sec.status === "completed" && (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Active Section text editor */}
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
                      
                      {activeSectionId ? (
                        <div className="bg-[#111113] rounded-xl border border-white/5 p-5 shadow-2xl flex-1 flex flex-col">
                          
                          {/* Active Section Header */}
                          <div className="mb-4 border-b border-white/5 pb-3 flex justify-between items-start">
                            <div>
                              <h1 className="text-xl font-bold text-white tracking-tight">
                                {activeProposal?.sections?.find(s => s.id === activeSectionId)?.title}
                              </h1>
                              <p className="text-slate-400 text-[11px] mt-0.5 font-mono">Premium Apple-Inspired Corporate AI Alignment Editor</p>
                            </div>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono uppercase font-semibold">
                              Section Model ACTIVE
                            </span>
                          </div>

                          {/* AI Generator parameters input panel */}
                          <div className="p-3 bg-blue-600/5 border border-blue-500/10 rounded-lg mb-4 space-y-2.5">
                            <h4 className="text-white text-xs font-semibold flex items-center gap-1.5 font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                              Ground Section Output with corporate semantic RAG specs
                            </h4>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={customPromptInstruction}
                                onChange={(e) => setCustomPromptInstruction(e.target.value)}
                                placeholder="Instructions e.g., 'Ensure we emphasize Okta gateway support, gold support response timeline, and Net-30 annual terms table.'"
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                              />
                              <button
                                onClick={handleGenerateSectionAI}
                                disabled={isGeneratingSection}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                {isGeneratingSection ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    Synthesizing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Generate via AI
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Mermaid Architecture rendering box if type Proposed Solution */}
                          {activeProposal?.sections?.find(s => s.id === activeSectionId)?.type === "Proposed Solution" && (
                            <div className="p-3 border border-blue-500/10 bg-[#0C0C0E] rounded-lg mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-white text-xs font-bold leading-none font-mono">Simulated Mermaid.js Systems Flowchart Model</h4>
                                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">Interactive Diagram</span>
                              </div>
                              <div className="bg-[#09090B] border border-white/5 p-3 rounded-md flex justify-center items-center">
                                <div className="text-xs font-mono text-center text-blue-400/80 leading-normal max-w-md">
                                  <div className="font-bold text-slate-300 text-left mb-1.5">graph TD</div>
                                  <div className="text-left pl-3 space-y-1">
                                    <div>1. User Client Request &rarr; SSO Gateway AD FS Active Nodes</div>
                                    <div>2. SSO Gateway AD FS Active Nodes &rarr; Active Directory SAML verification</div>
                                    <div>3. Security Session Tokens Authorization &rarr; Routing Gate proxies</div>
                                    <div>4. Microservices cluster metrics &rarr; Live dynamic performance dashboards</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Raw Output TextArea */}
                          <div className="flex-1 flex flex-col space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Document Content Workspace</label>
                            {isGeneratingSection ? (
                              <div className="flex-1 w-full bg-black/45 border border-blue-500/20 rounded-xl p-8 flex flex-col justify-center items-center gap-4 min-h-[350px]">
                                <ThinkingIndicator />
                                <span className="text-xs text-slate-400 font-mono animate-pulse uppercase tracking-wider text-center max-w-[400px]">Structuring paragraphs & rendering systems flowchart...</span>
                              </div>
                            ) : (
                              <textarea
                                value={sectionEditorContent}
                                onChange={(e) => setSectionEditorContent(e.target.value)}
                                rows={15}
                                className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none focus:border-blue-500/50 resize-block"
                              ></textarea>
                            )}
                          </div>

                          {/* Manual Editor buttons */}
                          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSaveSectionManual}
                                disabled={manualSavingSection}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                {manualSavingSection ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    Saving Draft...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Save Section Draft
                                  </>
                                )}
                              </button>
                              {manualSaveSuccessMsg && (
                                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 animate-pulse">
                                  <Check className="w-3.5 h-3.5" /> Saved!
                                </span>
                              )}
                              {isAutoSaving && (
                                <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3 animate-spin" /> Saving changes live...
                                </span>
                              )}
                              {!isAutoSaving && autoSaveDone && (
                                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> All changes saved live
                                </span>
                              )}
                            </div>
                            <span className="text-slate-500 text-[11px] flex items-center gap-1">
                              Section status: 
                              <span className="text-emerald-400 font-sans font-semibold">Live Workspace Active</span>
                            </span>
                          </div>

                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
                          Please select a mandatory proposal section on the left sidebar to initialize the workspace editor.
                        </div>
                      )}

                    </div>

                  </div>
                </section>

                {/* 3. RIGHT PANEL: AI Companion Chat */}
                {aiPanelSize !== "minimized" && (
                  <aside 
                    className={`${
                      aiPanelSize === "maximized" ? "w-[600px]" : "w-[380px]"
                    } border-l border-white/10 bg-[#0C0C0E] flex flex-col shrink-0 min-h-0 transition-all duration-300`}
                  >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                        <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Proposal AI Companion</h3>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setAiPanelSize(aiPanelSize === "standard" ? "maximized" : "standard")}
                          className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors"
                          title={aiPanelSize === "standard" ? "Maximize Chat (Expand width)" : "Standard Sidebar Size"}
                        >
                          {aiPanelSize === "standard" ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={() => setAiPanelSize("minimized")}
                          className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors"
                          title="Minimize (Hide AI Companion)"
                        >
                          <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                        </button>

                        <div className="w-px h-3 bg-white/10 mx-1" />

                        <button 
                          onClick={() => createChatSession("Refined Bid Guidance - " + new Date().toLocaleDateString())}
                          className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors"
                          title="New chat session"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  {/* Chat Message List */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <Sparkles className="w-8 h-8 text-blue-500/30 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">Ask the Companion about requirements, SLAs, compliance details, or pricing.</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end ml-auto" : "self-start"}`}
                        >
                          <div className={`p-3.5 rounded-2xl border ${msg.sender === "user" ? "bg-blue-600/10 text-blue-100 border-blue-500/20 rounded-br-none" : "bg-[#111113] text-slate-300 border-white/5 rounded-bl-none"}`}>
                            {msg.sender === "user" ? (
                              <p className="text-xs leading-relaxed text-left whitespace-pre-line">{msg.content}</p>
                            ) : (
                              <div className="text-xs text-left leading-relaxed col-span-1">
                                <Markdown
                                  components={{
                                    h1: ({node, ...props}) => <h1 className="text-sm font-bold mt-3 mb-1 text-white border-b border-white/5 pb-1" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xs font-bold mt-2.5 mb-1 text-blue-400" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-xs font-semibold mt-2 mb-0.5 text-white" {...props} />,
                                    p: ({node, ...props}) => <p className="text-xs text-slate-300 leading-relaxed mb-1.5" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-2 text-slate-300" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 mb-2 text-slate-300" {...props} />,
                                    li: ({node, ...props}) => <li className="text-xs text-slate-300" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-semibold text-white text-xs" {...props} />,
                                    code: ({node, ...props}) => <code className="bg-black/40 px-1 py-0.5 rounded text-[11px] font-mono text-pink-400" {...props} />
                                  }}
                                >
                                  {msg.content}
                                </Markdown>
                              </div>
                            )}
                            
                            {/* File citations */}
                            {msg.referenceSources && msg.referenceSources.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-col gap-1 text-left">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-400 font-mono">GROUNDED REFERENCESRetrieved (FAISS Index):</span>
                                {msg.referenceSources.map((source, sIdx) => (
                                  <span key={sIdx} className="text-[9px] text-[#A1A1AA] font-mono break-all leading-normal flex items-center gap-1">
                                    <BookOpen className="w-2.5 h-2.5 shrink-0" />
                                    {source}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500 mt-1 self-end font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                    {isSendingChatMessage && (
                      <div className="pt-2 flex flex-col space-y-2">
                        <ThinkingIndicator />
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <div className="p-4 border-t border-white/10">
                    <form onSubmit={sendChatMessage} className="relative">
                      <textarea 
                        placeholder="Ask the Companion..." 
                        rows={3}
                        value={currentChatMessage}
                        onChange={(e) => setCurrentChatMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage(e);
                          }
                        }}
                        className="w-full bg-[#111113] border border-white/10 rounded-xl p-3 inline-block pr-12 pb-10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                      ></textarea>
                      
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentChatMessage("Summarize current SOC2 & SSO integration requirements inside the active RFP.");
                          }}
                          className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 hover:text-white text-[9px] font-mono font-bold"
                          title="Generate query instruction"
                        >
                          FAQ Prompt
                        </button>
                      </div>

                      <button 
                        type="submit"
                        disabled={isSendingChatMessage || !currentChatMessage.trim()}
                        className="absolute bottom-3 right-3 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        {isSendingChatMessage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      </button>
                    </form>
                  </div>
                </aside>
              )}

              </div>
            )}

            {/* TAB: HISTORICAL ARCHIVES */}
            {activeTab === "history" && (
              <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">Proposal Response Archives</h1>
                  <p className="text-sm text-[#A1A1AA]">Historical repository of curated enterprise bids, client compliance rates, and print-ready PDF assets.</p>
                </div>

                <div className="bg-[#0C0C0E] border border-white/5 rounded-xl p-6 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          <th className="pb-3 pl-2">Proposal Details</th>
                          <th className="pb-3 text-center">Associated RFP</th>
                          <th className="pb-3 text-center">Commercial Value</th>
                          <th className="pb-3 text-center">Completion Ratio</th>
                          <th className="pb-3 text-center">Last Modified</th>
                          <th className="pb-3 text-right pr-2">Workspace Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {proposals.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-500">No archived responses found. Get started by uploading an RFP details first.</td>
                          </tr>
                        ) : (
                          proposals.map((prop) => (
                            <tr key={prop.id} className="group hover:bg-white/5 transition-colors">
                              <td className="py-4 pl-2">
                                <div className="font-semibold text-white group-hover:text-blue-400 transition-all">{prop.title}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Proposal ID: {prop.id}</div>
                              </td>
                              <td className="py-4 text-center">
                                <span className="text-slate-300 font-medium">{prop.rfpTitle.split(":")[0]}</span>
                              </td>
                              <td className="py-4 text-center font-mono font-medium text-emerald-400">
                                ${prop.pricingSummary?.oneTimeFee.toLocaleString()} Setup + ${prop.pricingSummary?.recurringFee.toLocaleString()}/yr
                              </td>
                              <td className="py-4 text-center font-mono font-semibold">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">100% Validated</span>
                              </td>
                              <td className="py-4 text-center text-slate-400 font-mono">
                                {new Date(prop.lastModified).toLocaleDateString()}
                              </td>
                              <td className="py-4 text-right pr-2">
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedProposalId(prop.id);
                                      if (prop.sections && prop.sections.length > 0) {
                                        setActiveSectionId(prop.sections[0].id);
                                        setSectionEditorContent(prop.sections[0].content);
                                      }
                                      setActiveTab("workspace");
                                    }}
                                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-[11px] font-semibold border border-white/10 cursor-pointer"
                                  >
                                    Workspace
                                  </button>
                                  <a 
                                    href={`/api/export/${prop.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 rounded text-[11px] font-semibold flex items-center gap-1"
                                  >
                                    <FileDown className="w-3.5 h-3.5" />
                                    PDF
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Sub-footer Status Bar */}
      <footer className="h-6 bg-blue-600 flex items-center px-4 justify-between text-[10px] font-medium text-white select-none shrink-0 border-t border-blue-500 sticky bottom-0 z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            Local FAISS Index: Healthy
          </span>
          <span className="hidden sm:inline font-mono">|</span>
          <span className="hidden sm:inline">JSON Storage Persistence: Operating</span>
          <span className="hidden sm:inline font-mono">|</span>
          <span className="hidden sm:inline">Active User Role: {currentUser?.role || "Visitor"}</span>
        </div>
        <div className="flex items-center gap-3 italic">
          ProposalAI v1.0.2-alpha &bull; Connected Mode
        </div>
      </footer>

    </div>
  );
}
