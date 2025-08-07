import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "@fontsource/bebas-neue";
import clickSound from "@/assets/click.mp3";

const tarkovTheme = "font-bebas-neue bg-neutral-900 text-neutral-100 tracking-wide";

const gunData = [
  {
    name: "Glock 19 Gen5",
    image: "/guns/glock19.jpg",
    caliber: "9mm",
    basePrice: 539.99,
    attachments: [
      { name: "Trijicon RMR", type: "Optic", livePriceUrl: "https://api.mockmods.com/rmr", image: "/attachments/rmr.jpg" },
      { name: "Streamlight TLR-1", type: "Light", livePriceUrl: "https://api.mockmods.com/tlr1", image: "/attachments/tlr1.jpg" }
    ]
  },
  {
    name: "M&P Shield Plus",
    image: "/guns/mp_shield.jpg",
    caliber: "9mm",
    basePrice: 449.00,
    attachments: [
      { name: "Holosun 507K", type: "Optic", livePriceUrl: "https://api.mockmods.com/507k", image: "/attachments/507k.jpg" },
      { name: "Crimson Trace Laser", type: "Laser", livePriceUrl: "https://api.mockmods.com/laser", image: "/attachments/laser.jpg" }
    ]
  }
];

export default function GunIQ() {
  const [search, setSearch] = useState("");
  const [zip, setZip] = useState("");
  const [user, setUser] = useState(null);
  const [selectedGun, setSelectedGun] = useState(null);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [livePrices, setLivePrices] = useState({});

  const playSound = () => {
    const audio = new Audio(clickSound);
    audio.play();
  };

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleGunSelect = (gun) => {
    playSound();
    setSelectedGun(gun);
    setSelectedAttachments([]);
    fetchAttachmentPrices(gun.attachments);
  };

  const fetchAttachmentPrices = async (attachments) => {
    const updates = {};
    for (const att of attachments) {
      try {
        const res = await fetch(att.livePriceUrl);
        const json = await res.json();
        updates[att.name] = json.price;
      } catch {
        updates[att.name] = null;
      }
    }
    setLivePrices(updates);
  };

  const handleAttachmentToggle = (attachment) => {
    const exists = selectedAttachments.find((a) => a.name === attachment.name);
    if (exists) {
      setSelectedAttachments((prev) => prev.filter((a) => a.name !== attachment.name));
    } else {
      setSelectedAttachments((prev) => [...prev, attachment]);
    }
  };

  const totalPrice =
    (selectedGun?.basePrice || 0) +
    selectedAttachments.reduce((sum, att) => sum + (livePrices[att.name] || 0), 0);

  return (
    <div className={\`min-h-screen p-6 \${tarkovTheme}\`}> 
      <h1 className="text-5xl font-bold text-center mb-6 drop-shadow-lg">
        GunIQ: Firearm Price & Stat Tracker
      </h1>

      {!user ? (
        <div className="text-center mb-6">
          <Button onClick={signIn}>Sign in with Google</Button>
        </div>
      ) : (
        <div className="text-center text-green-400 mb-4">
          Welcome, {user.displayName}!
        </div>
      )}

      {!selectedGun && (
        <div className="max-w-xl mx-auto mb-6 space-y-4">
          <Input
            className="bg-neutral-800 text-white placeholder:text-neutral-400 border border-gray-700"
            placeholder="Search firearms (e.g., Glock, Sig, AR-15)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            className="bg-neutral-800 text-white placeholder:text-neutral-400 border border-gray-700"
            placeholder="Enter your ZIP code for local availability"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        </div>
      )}

      {!selectedGun ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {gunData.map((gun, idx) => (
            <Card
              key={idx}
              className="bg-neutral-800 border-2 border-yellow-700 hover:border-yellow-500 transition-transform transform hover:scale-105 shadow-md cursor-pointer"
              onClick={() => handleGunSelect(gun)}
            >
              <CardContent className="p-4">
                <img src={gun.image} alt={gun.name} className="w-full h-40 object-cover mb-2 rounded" />
                <h2 className="text-2xl text-yellow-400 mb-2">{gun.name}</h2>
                <p className="text-sm">Caliber: {gun.caliber}</p>
                <p className="text-sm">Base Price: ${gun.basePrice.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-800 border border-yellow-700 p-6 mt-6 max-w-4xl mx-auto rounded-lg">
          <h2 className="text-3xl text-yellow-400 mb-4">{selectedGun.name} Loadout Builder</h2>
          <img src={selectedGun.image} alt={selectedGun.name} className="w-full h-64 object-cover mb-4 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedGun.attachments.map((att, idx) => (
              <div
                key={idx}
                onClick={() => handleAttachmentToggle(att)}
                className={\`p-3 border rounded cursor-pointer \${
                  selectedAttachments.find((a) => a.name === att.name)
                    ? "border-green-500"
                    : "border-gray-600"
                } hover:border-yellow-400 transition\`}
              >
                <img src={att.image} alt={att.name} className="w-full h-32 object-cover rounded mb-2" />
                <div className="text-lg">{att.name}</div>
                <div className="text-sm text-neutral-400">Type: {att.type}</div>
                <div className="text-sm text-green-400">
                  {livePrices[att.name] ? `$${livePrices[att.name].toFixed(2)}` : "Loading..."}
                </div>
              </div>
            ))}
          </div>
          <div className="text-right text-xl text-green-400 mt-6">
            Total Loadout Price: ${totalPrice.toFixed(2)}
          </div>
          <div className="text-center mt-6">
            <Button onClick={() => setSelectedGun(null)}>Back to All Guns</Button>
          </div>
        </div>
      )}
    </div>
  );
}