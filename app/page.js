"use client";
import { useState, useRef, useEffect } from "react";
import { FaRegPaperPlane, FaSpinner } from "react-icons/fa6";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    const modelReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";

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
      <div className="p-4 w-[800px] h-[800px] text-white rounded-md border-2 border-main-color flex flex-col">
        <div
          ref={scrollRef}
          className="flex-1 flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <p
                className={`text-white p-2 max-w-[650px] ${
                  msg.role === "user"
                    ? "bg-gray-800 rounded-bl-lg rounded-tl-lg rounded-tr-lg ml-auto"
                    : "bg-green-500 rounded-br-lg rounded-tl-lg rounded-tr-lg mr-auto"
                }`}
              >
                {msg.content}
              </p>
            </div>
          ))}
        </div>

        <div className="w-full flex gap-2">
          <input
            type="text"
            placeholder="Enter message..."
            className="flex-1 h-10 rounded-md border-2 border-main-color p-2"
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
