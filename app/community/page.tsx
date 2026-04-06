"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getFriends, sendFriendRequest, acceptFriendRequest, declineFriendRequest, setFriendLevel } from "@/app/actions";
import { usePreferences } from "@/context/PreferencesContext";

interface User {
  id: string;
  name: string | null;
  email: string;
  level?: string;
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const { t } = usePreferences();
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingSent, setPendingSent] = useState<User[]>([]);
  const [pendingReceived, setPendingReceived] = useState<User[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (session) {
      loadFriends();
    }
  }, [session]);

  const loadFriends = async () => {
    const data = await getFriends();
    setFriends(data.friends);
    setPendingSent(data.pendingSent);
    setPendingReceived(data.pendingReceived);
  };

  const handleSendRequest = async () => {
    if (!email.trim()) return;
    try {
      await sendFriendRequest(email);
      setEmail("");
      loadFriends();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAccept = async (senderId: string) => {
    await acceptFriendRequest(senderId);
    loadFriends();
  };

  const handleDecline = async (senderId: string) => {
    await declineFriendRequest(senderId);
    loadFriends();
  };

  const handleSetLevel = async (friendId: string, level: "REGULAR" | "CLOSE") => {
    await setFriendLevel(friendId, level);
    loadFriends();
  };

  if (!session) {
    return <div className="text-center py-8">Please sign in to view your community.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t("community")}</h1>

      {/* Send Friend Request */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Send Friend Request</h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Friend's email"
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleSendRequest}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Send
          </button>
        </div>
      </div>

      {/* Pending Received */}
      {pendingReceived.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Friend Requests</h2>
          <div className="space-y-2">
            {pendingReceived.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(user.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(user.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Friends</h2>
        {friends.length === 0 ? (
          <p className="text-slate-500">No friends yet.</p>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-sm text-slate-500">{friend.email}</p>
                </div>
                <select
                  value={friend.level}
                  onChange={(e) => handleSetLevel(friend.id, e.target.value as "REGULAR" | "CLOSE")}
                  className="px-2 py-1 border rounded-md"
                >
                  <option value="REGULAR">Regular</option>
                  <option value="CLOSE">Close</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Sent */}
      {pendingSent.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sent Requests (Pending)</h2>
          <div className="space-y-2">
            {pendingSent.map((user) => (
              <div key={user.id} className="p-3 border rounded-md">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
