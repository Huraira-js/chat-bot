"use client";
import { useState, useRef, useEffect } from "react";
import { FaRegPaperPlane, FaRobot, FaSpinner, FaUser } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
const API_KEYS = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_3,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_4,
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const scrollRef = useRef(null);

  function getNextKey() {
    const key = API_KEYS[currentKeyIndex];
    setCurrentKeyIndex((prev) => (prev + 1) % API_KEYS.length);
    return key;
  }

  const sendMessageToServer = async (msg) => {
    setLoading(true);
    const updatedMessages = [...messages, { role: "user", content: msg }];
    setMessages(updatedMessages);

    const payload = {
      contents: updatedMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${getNextKey()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      toast.error("Something went wrong");
      setLoading(false);
      return;
    }
    const data = await res.json();
    const modelReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text || data?.error?.message;
    setMessages((prev) => [...prev, { role: "model", content: modelReply }]);

    setMessage("");
    setLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-[100vh] w-full flex items-center justify-center">
      <div className="p-4 w-full h-full max-w-[800px] max-h-[800px] text-white rounded-md border-2 border-main-color flex flex-col">
        <div className="w-full flex items-center justify-center py-4">
          <h1 className="text-2xl font-bold">ChatBot</h1>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } ${i === 0 ? "mt-auto" : ""}`}
            >
              {msg.role === "model" && (
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <FaRobot className="text-white" />
                </div>
              )}
              <div
                className={`text-white p-2 max-w-[650px] break-words ${
                  msg.role === "user"
                    ? "bg-gray-800 rounded-bl-lg rounded-tl-lg rounded-tr-lg ml-auto"
                    : "bg-green-500 rounded-br-lg rounded-tl-lg rounded-tr-lg mr-auto"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  <ReactMarkdown
                    components={{
                      code({ inline, children }) {
                        return inline ? (
                          <code className="bg-black/40 px-1 rounded">
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-black p-3 rounded mt-2 overflow-x-auto text-sm">
                            <code>{children}</code>
                          </pre>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <FaUser className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="w-full flex gap-2">
          <textarea
            type="text"
            placeholder="Enter message..."
            className="flex-1 rounded-md border-2 border-main-color p-2 resize-none focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim() !== "" && !loading) {
                sendMessageToServer(message.trim());
              }
            }}
          />
          <button
            onClick={() => {
              if (message.trim() !== "" && !loading)
                sendMessageToServer(message.trim());
            }}
            className="w-fit h-10 max-w-[100px] rounded-md border-2 border-main-color p-2"
          >
            {loading ? (
              <FaSpinner className="animate-spin text-white" />
            ) : (
              <FaRegPaperPlane />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
