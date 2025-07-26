"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { Textarea } from "./ui/textarea";
import { createConversation, saveConversation } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "@/lib/api-config";

type FileRow = {
  name: string;
  path: string;
  preview: string;
  fullText?: string;
  status: "pending" | "completed" | "error";
  predicted_class?: string;
  tags?: string[];
  justification?: string;
};

export default function BatchImportPage() {
  const [loading, setLoading] = useState(false);
  const [fileRows, setFileRows] = useState<FileRow[]>([]);
  const [sortKey, setSortKey] = useState<keyof FileRow>("status");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileRow | null>(null);


  const [checkText, setCheckText] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const router = useRouter();

  const writeToConsole = (message: string) => {
      const consoleOutput = document.getElementById("console-output");
      if (consoleOutput) {
        consoleOutput.innerHTML += `<p class="text-gray-600">${message}</p>`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight; // scroll to bottom
      }
    };
  
  const handleCheckSpam = async () => {
      if (!checkText.trim()) return;
      setChecking(true);
      try {
        const res = await fetch("http://localhost:8000/api/classify", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ text: checkText }),
        });
        const data = await res.json();
        console.log("Spam check result:", data);
        if (!res.ok) throw new Error(data.error || "Failed to check spam");
        setCheckResult(data);
        writeToConsole(`Spam check result: ${data.label}`);
      } catch {
        setCheckResult(null);
        writeToConsole("Error checking spam");
      } finally {
        setChecking(false);
      }
    };


  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const newRows: FileRow[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();
      newRows.push({
        name: file.name,
        path: file.webkitRelativePath || file.name,
        preview: content.replace(/\s+/g, " ").substring(0, 100),
        fullText: content,
        status: "pending",
      });
    }

    setFileRows(newRows);
    setLoading(false);

    const batchSize = 10;
    for (let i = 0; i < newRows.length; i += batchSize) {
      const batch = newRows.slice(i, i + batchSize);
      await Promise.all(
        batch.map((file, idx) => classifyFile(i + idx, file.preview))
      );
    }
    writeToConsole(`Processed ${newRows.length} files`);
  };

  const classifyFile = async (index: number, content: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to classify");

      setFileRows((prev) => {
        const updated = [...prev];
        updated[index].status = "completed";
        updated[index].predicted_class = data.label;
        updated[index].tags = data.tags;
        updated[index].justification = data.justification;
        return updated;
      });
      writeToConsole(`File ${index + 1} classified: ${data.label}`);
    } catch {
      setFileRows((prev) => {
        const updated = [...prev];
        updated[index].status = "error";
        return updated;
      });
    }
  };

  const handleCreateConversation = (file: FileRow) => {
    const message = {
      id: Date.now().toString() + Math.random(),
      title: file.preview.split("\n")[0] || file.name,
      sender: 'scammer' as const,
      text: file.fullText || "error",
      timestamp: Date.now(),
    };

    
    const conv = {
      id: Date.now().toString(),
      title: file.name,
      messages: [message],
    };
    
    writeToConsole(`Creating conversation: ${conv.title}`);

    // Save individual conv:* and update central index
    saveConversation(conv);

    // Also update main index list used by Conversations page
    const storedList = JSON.parse(localStorage.getItem("conversations") || "[]");
    const updatedList = [...storedList, conv];
    localStorage.setItem("conversations", JSON.stringify(updatedList));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent("storage", { 
      key: "conversations",
      newValue: JSON.stringify(updatedList),
      oldValue: JSON.stringify(storedList)
    }));
  };


  useEffect(() => {
    // Load existing conversations from localStorage on mount
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("conv:"));
    const conversations = keys.map((key) => JSON.parse(localStorage.getItem(key)!));
    //setConversations(conversations);
  }, []);

  // Debug effect to track selectedFile changes
  useEffect(() => {
    console.log("selectedFile changed:", selectedFile);
    console.log("Dialog should be open:", !!selectedFile);
  }, [selectedFile]);

  const handleAddAllScam = () => {
    const scamEmails = fileRows.filter((f) => 
      f.predicted_class && (
        f.predicted_class.toLowerCase().includes("spam") || 
        f.predicted_class.toLowerCase().includes("scam") ||
        f.predicted_class.toLowerCase().includes("phishing")
      )
    );

    const storedList = JSON.parse(localStorage.getItem("conversations") || "[]");
    const newConversations: any[] = [];

    scamEmails.forEach((f) => {
      const message = {
        id: Date.now().toString() + Math.random(),
        title: f.preview.split("\n")[0] || f.name,
        sender: 'scammer' as const,
        text: f.fullText || "error",
        timestamp: Date.now(),
      };

      const conv = {
        id: Date.now().toString() + Math.random(),
        title: f.name,
        messages: [message],
      };

      saveConversation(conv);
      newConversations.push(conv);
    });

    const updatedList = [...storedList, ...newConversations];
    localStorage.setItem("conversations", JSON.stringify(updatedList));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent("storage", { 
      key: "conversations",
      newValue: JSON.stringify(updatedList),
      oldValue: JSON.stringify(storedList)
    }));

    writeToConsole(`Added ${scamEmails.length} scam input to conversations`);
  };

  


  const sortedRows = [...fileRows].sort((a, b) => {
    if (!a[sortKey] || !b[sortKey]) return 0;
    const valA = a[sortKey]!;
    const valB = b[sortKey]!;
    if (typeof valA === "string") {
      return sortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }
    return sortAsc ? +valA - +valB : +valB - +valA;
  });

  return (
    <main className="spam-check-main">
      <div className="spam-check-container">
        {/* Single Message Spam Check Section */}
        <div className="spam-check-section">
          <div className="section-header">
            <h1 className="main-title">Spam Check Tool</h1>
            <p className="subtitle">
              Use this tool to check if a single message is spam. Paste the message below and click "Check Spam".
            </p>
          </div>

          <div className="input-section">
            <h2 className="section-title">Single Message Spam Check</h2>
            <Textarea
              placeholder="Paste message here to check if it's spam..."
              rows={4}
              value={checkText}
              onChange={(e) => setCheckText(e.target.value)}
              className="spam-textarea"
            />
            <div className="button-container">
              <Button onClick={handleCheckSpam} disabled={checking || !checkText.trim()}>
                {checking ? "Checking..." : "Check Spam"}
              </Button>
            </div>

            {checkResult && (
              <div className="result-container">
                <h3 className="result-title">Check Result</h3>
                <div className="result-item">
                  <span className="result-label">Predicted Class:</span>
                  <span className="result-value">{checkResult.label}</span>
                </div>

                {checkResult.tags && (
                  <div className="result-item">
                    <span className="result-label">Tags:</span>
                    <span className="result-tags">{checkResult.tags.join(", ")}</span>
                  </div>
                )}

                {checkResult.justification && (
                  <div className="result-item">
                    <span className="result-label">Justification:</span>
                    <div className="result-justification">
                      {checkResult.justification}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Batch Email Import Section */}
        <div className="batch-import-section">
          <div className="section-header">
            <h1 className="main-title">Batch File Import</h1>
            <p className="subtitle">
              Select a folder containing files with text contents to classify them as scam or safe. 
              The tool will read the files and classify them automatically.
            </p>
          </div>

          <div className="file-input-section">
            <input
              type="file"
              {...({ webkitdirectory: "true" } as any)}
              multiple
              onChange={handleFiles}
              className="file-input"
            />
          </div>

          {loading && (
            <div className="loading-container">
              <Loader2 className="animate-spin w-5 h-5" />
              <span>Reading files...</span>
            </div>
          )}

          {!loading && fileRows.length > 0 && (
            <div className="results-section">
              <div className="results-header">
                <Button className="add-all-button" onClick={handleAddAllScam}>
                  Add All Scam Files to Conversations
                </Button>
              </div>

              <div className="table-container">
                <table className="results-table">
                  <thead>
                    <tr className="table-header">
                      {["Status", "Predicted Class", "Tags", "Justification", "Preview", "Actions"].map((title) => (
                        <th key={title} className="table-header-cell">
                          {title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((file, idx) => (
                      <tr key={`${file.name}-${idx}`} className="table-row">
                        {/* Status */}
                        <td className="table-cell">
                          <span className={`spam-status-badge spam-status-${file.status}`}>
                            {file.status}
                          </span>
                        </td>

                        {/* Predicted Class */}
                        <td className="table-cell">
                          {file.predicted_class ?? "-"}
                        </td>

                        {/* Tags */}
                        <td className="table-cell">
                          {file.tags?.length ? file.tags.join(", ") : "-"}
                        </td>

                        {/* Justification */}
                        <td className="table-cell justification-cell">
                          <div className="truncate" title={file.justification}>
                            {file.justification ?? "-"}
                          </div>
                        </td>

                        {/* Preview */}
                        <td className="table-cell preview-cell">
                          {file.preview}
                        </td>

                        {/* Actions */}
                        <td className="table-cell">
                          <div className="action-buttons">
                            <Button
                              className="action-button primary"
                              onClick={() => handleCreateConversation(file)}
                            >
                              Add to Chat
                            </Button>
                            <Button
                              className="action-button secondary"
                              onClick={() => {
                                console.log("Preview button clicked for file:", file);
                                setSelectedFile(file);
                                console.log("selectedFile state should be set to:", file);
                              }}
                            >
                              Preview
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Modal */}
      {selectedFile && (
        <div className="spam-check-main-modal">
          {/* Modal overlay */}
          <div
            className="modal-overlay"
            onClick={() => setSelectedFile(null)}
          />

          {/* Modal content */}
          <div className="modal-container">
            <div className="modal-content">
              
              {/* Header */}
              <div className="modal-header">
                <h3 className="modal-title">File Preview</h3>
                <Button
                  onClick={() => setSelectedFile(null)}
                  className="close-button"
                >
                  ✕
                </Button>
              </div>

              {/* File Information */}
              {selectedFile && (
                <div className="info-grid">
                  <div className="info-section">
                    {/* Selected File */}
                    <div className="info-card">
                      <span className="info-label">Selected File</span>
                      <p className="info-value">
                        {selectedFile.name || "Unknown"}
                      </p>
                    </div>

                    {/* Predicted Class */}
                    <div className="info-card">
                      <span className="info-label">Predicted Class</span>
                      <p className={`predicted-class ${
                        selectedFile.predicted_class?.toLowerCase().includes('spam') || 
                        selectedFile.predicted_class?.toLowerCase().includes('scam') ||
                        selectedFile.predicted_class?.toLowerCase().includes('phishing')
                          ? "spam"
                          : "safe"
                      }`}>
                        {selectedFile.predicted_class ?? "Not classified"}
                      </p>
                    </div>
                  </div>

                  <div className="info-section">
                    {/* Tags */}
                    <div className="info-card">
                      <span className="info-label">Tags</span>
                      <div className="tags-container">
                        {selectedFile.tags?.length ? (
                          <div className="tags-list">
                            {selectedFile.tags.map((tag) => (
                              <span key={tag} className="tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="no-tags">No tags available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Justification */}
              {selectedFile?.justification && (
                <div className="justification-section">
                  <div className="info-card">
                    <span className="info-label">Analysis Justification</span>
                    <div className="justification-content">
                      {selectedFile.justification}
                    </div>
                  </div>
                </div>
              )}

              {/* Full Content */}
              <div className="content-section">
                <span className="content-label">Full Content</span>
                <div className="content-display">
                  <pre className="content-text">
                    {selectedFile?.fullText || "No content available"}
                  </pre>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <Button
                  onClick={() => setSelectedFile(null)}
                  className="footer-button"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
