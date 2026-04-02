import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: any) => {
  e.preventDefault();
  try {
    const res = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      }
    );

    const data = await res.json();

     if (res.ok) {
  localStorage.setItem("token", data.token);

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  window.location.href = "/";
}

    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async (e: any) => {
  e.preventDefault();
  try {
    const res = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      }
    );

    const data = await res.json();
      if (res.ok) {
  localStorage.setItem("token", data.token);

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  window.location.href = "/";
}

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="min-h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden border-t border-slate-800">
      
      {/* Constellation Background Elements */}
     {/* STARFIELD BACKGROUND */}
<svg
  className="absolute inset-0 w-full h-full pointer-events-none"
  viewBox="0 0 1200 600"
  preserveAspectRatio="none"
>
  {/* FAR SMALL STARS */}
  {Array.from({ length: 200 }).map((_, i) => {
    const cx = Math.random() * 1200;
    const cy = Math.random() * 600;
    const r = Math.random() * 0.7 + 0.2;

    return (
      <motion.circle
        key={"small-" + i}
        cx={cx}
        cy={cy}
        r={r}
        fill="#ffffff"
        initial={{ opacity: 0.1 }}
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 2 + Math.random() * 4,
          delay: Math.random() * 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  })}

  {/* MEDIUM STARS */}
  {Array.from({ length: 80 }).map((_, i) => {
    const cx = Math.random() * 1200;
    const cy = Math.random() * 600;
    const r = Math.random() * 1.3 + 0.6;

    return (
      <motion.circle
        key={"mid-" + i}
        cx={cx}
        cy={cy}
        r={r}
        fill="#ffffff"
        initial={{ opacity: 0.2 }}
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3 + Math.random() * 3,
          delay: Math.random() * 4,
          repeat: Infinity,
        }}
      />
    );
  })}

  {/* BIG GLOW STARS */}
  {Array.from({ length: 25 }).map((_, i) => {
    const cx = Math.random() * 1200;
    const cy = Math.random() * 600;
    const r = Math.random() * 2 + 1;

    return (
      <motion.circle
        key={"big-" + i}
        cx={cx}
        cy={cy}
        r={r}
        fill="#ffffff"
        style={{
          filter: "drop-shadow(0 0 6px white)",
        }}
        initial={{ opacity: 0.4 }}
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 4 + Math.random() * 4,
          delay: Math.random() * 5,
          repeat: Infinity,
        }}
      />
    );
  })}
</svg>

      {/* 3. MASSIVE BACKGROUND WATERMARK (Z-15) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} // 100% opacity so it physically blocks the lines
        transition={{ duration: 2 }}
        // Using #0b1229 makes it slightly lighter than the background, but solid.
        // Increased text size and added whitespace-nowrap to make it stretch massively.
        className=" hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] md:text-[25vw] font-black text-[#0b1229] whitespace-nowrap pointer-events-none select-none tracking-tighter z-10 drop-shadow-2xl"
      >
        ZENITH
      </motion.div>

      {/* 4. MAIN AMBIENT GLOW (Z-15) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none z-15" />

        {/* 5. THE GLASSMORPHIC AUTH CARD (Z-20) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-20 w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] p-10 shadow-2xl"
      >
        {/* Toggle Switch */}
        <div className="flex bg-slate-950/50 p-1.5 rounded-full border border-slate-800 mb-10 relative cursor-none">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 relative z-10 py-2.5 rounded-full text-sm font-bold transition-colors cursor-none ${
              isLogin ? "text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 relative z-10 py-2.5 rounded-full text-sm font-bold transition-colors cursor-none ${
              !isLogin ? "text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>

          <motion.div
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-emerald-400 rounded-full z-0 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
            animate={{ left: isLogin ? "6px" : "calc(50% + 0px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        {/* Form Area */}
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            {/* LOGIN FORM */}
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
                onSubmit={handleLogin}
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Email Address
                  </label>
                  <input
                    value={email}
                    type="email"
                    placeholder="om@gmail.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center pl-1 pr-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs font-bold text-emerald-500 hover:text-emerald-400 cursor-none"
                    >
                      Forgot?
                    </a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none"
                  />
                </div>
                <button type="submit" className="w-full mt-4 bg-white hover:bg-slate-200 text-slate-950 font-black text-lg py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-none">
                  Initialize Session
                </button>
              </motion.form>
            ) : (
              /* REGISTER FORM */
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
                onSubmit={handleRegister}
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Om Devmurari"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Email Address
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="om@gmail.com"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none"
                  />
                </div>
                <button type="submit" className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(52,211,153,0.3)] cursor-none">
                  Create Zenith ID
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </section>
  );
}