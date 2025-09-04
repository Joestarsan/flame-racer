import { useEffect, useRef } from "react";

// ClassicEngine: Imperative FR-1.0.8 gameplay restored inside React
// This isolates the game loop from React re-renders to ensure perfect smoothness
export const ClassicEngine = () => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current!;

    // Build minimal DOM structure (scoped under host)
    host.innerHTML = `
      <div id="game" tabindex="0" role="application" aria-label="Flame Racer" style="position:relative;width:900px;height:600px;margin:0 auto;border-radius:22px;overflow:hidden;transform-origin:center center;background:linear-gradient(180deg,rgba(12,17,36,.88),rgba(7,10,20,.88));box-shadow:0 22px 60px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.05)">
        <div id="hud" style="position:absolute;inset:0;padding:16px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none;z-index:3">
          <div class="hud-bar" style="width:100%;display:flex;justify-content:space-between">
            <div class="hud-left">
              <div class="chip" style="pointer-events:auto;margin-right:10px;padding:8px 12px;border-radius:12px;font-weight:700;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.12)">Score: <span id="score">0</span></div>
              <div class="chip" style="pointer-events:auto;margin-right:10px;padding:8px 12px;border-radius:12px;font-weight:700;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.12)">Speed: <span id="speed">1.00×</span></div>
              <div class="chip" style="pointer-events:auto;margin-right:10px;padding:8px 12px;border-radius:12px;font-weight:700;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.12)">Best: <span id="best">0</span></div>
            </div>
            <div class="hud-right"><div class="chip" style="pointer-events:auto;padding:8px 12px;border-radius:12px;font-weight:700;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.12)">Move: ← → or A D</div></div>
          </div>
        </div>
        <div id="fx-embers" style="position:absolute;inset:0;overflow:hidden;z-index:1;pointer-events:none"></div>
        <div id="entities" style="position:absolute;inset:0;z-index:2"></div>
        <div id="track" style="position:absolute;inset:0;z-index:1"></div>
        <div id="menu" aria-hidden="false" style="position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(1200px 800px at 70% -10%, rgba(255,140,60,.16), rgba(0,0,0,.35));z-index:3">
          <div class="panel" style="width:min(92%,640px);padding:22px 22px 18px;border-radius:18px;position:relative;background:linear-gradient(180deg,rgba(12,17,36,.9),rgba(7,10,20,.9));border:1px solid rgba(255,170,80,.22);box-shadow:0 16px 50px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03) inset;backdrop-filter:blur(6px) saturate(1.05)">
            <h1 style="margin:0 0 10px;font-size:28px;letter-spacing:.2px">Flame Racer</h1>
            <p style="margin:8px 0 16px;opacity:.92;line-height:1.4">Be the Fogo flame. Dodge network hazards (Spam Floods, MEV Bots, Latency Spikes), collect sparks, and show why FogoChain is fast.</p>
            <div class="btn-row">
              <button id="menu-start" class="btn" type="button" style="appearance:none;border:0;cursor:pointer;font-weight:800;letter-spacing:.3px;padding:12px 16px;border-radius:14px;font-size:14px;background:linear-gradient(180deg,#ffb168,#ff5b3d);color:#0b0f19;box-shadow:0 10px 22px rgba(255,100,40,.35), 0 0 0 1px rgba(255,255,255,.08) inset">Start Game (Enter)</button>
            </div>
          </div>
        </div>
        <div id="overlay" aria-hidden="true" style="position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.35);opacity:0;pointer-events:none;transition:opacity .25s ease">
          <div id="go-toast" class="toast" hidden style="width:min(92%,420px);padding:16px;border-radius:16px;text-align:left;background:linear-gradient(180deg,rgba(12,17,36,.95),rgba(7,10,20,.92));border:1px solid rgba(255,170,80,.22);box-shadow:0 20px 60px rgba(0,0,0,.6)">
            <h2 style="margin:0 0 8px;font-size:20px">Game Over</h2>
            <p style="margin:6px 0 14px;opacity:.9">Your score: <strong id="final-score">0</strong></p>
            <div class="btn-row" style="display:flex;gap:10px;flex-wrap:wrap">
              <button id="btn-try" class="btn" type="button" style="appearance:none;border:0;cursor:pointer;font-weight:800;letter-spacing:.3px;padding:12px 16px;border-radius:14px;font-size:14px;background:transparent;color:#e7ecff;border:1px solid rgba(255,255,255,.18)">Try Again (R)</button>
              <button id="btn-menu" class="btn" type="button" style="appearance:none;border:0;cursor:pointer;font-weight:800;letter-spacing:.3px;padding:12px 16px;border-radius:14px;font-size:14px;background:transparent;color:#e7ecff;border:1px solid rgba(255,255,255,.18)">Main Menu</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Styles local to host
    const style = document.createElement('style');
    style.textContent = `
      #game { transform: scale(${Math.min((window.innerWidth - 32) / 900, (window.innerHeight - 32) / 600)}); }
      .player { width:42px;height:60px;position:absolute;left:0;top:0;transform-origin:50% 100%;z-index:4;animation:glow .9s ease-in-out infinite alternate;}
      .player img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 12px rgba(255,159,63,.6)) drop-shadow(0 0 24px rgba(255,77,46,.4));}
      @keyframes glow{from{filter:drop-shadow(0 0 6px rgba(255,159,63,.55)) drop-shadow(0 0 14px rgba(255,77,46,.25));}to{filter:drop-shadow(0 0 12px rgba(255,159,63,.85)) drop-shadow(0 0 26px rgba(255,77,46,.45));}}
      .obstacle{ position:absolute; border-radius:12px; background:linear-gradient(180deg,#353a58,#151a2f); border:1px solid rgba(255,255,255,.08); box-shadow:0 6px 18px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.35) inset; }
      .bonus{ position:absolute; width:26px; height:26px; border-radius:50%; background: radial-gradient(60% 60% at 50% 35%, #ffffffaa, transparent 65%), radial-gradient(100% 100% at 50% 70%, #ffd166, transparent 62%), radial-gradient(100% 100% at 50% 70%, #ffb703, transparent 62%); box-shadow:0 0 16px #ffd166aa, 0 0 28px #ffd16677; }
    `;
    host.appendChild(style);

    // Utility
    const clamp = (v:number, a:number, b:number) => Math.max(a, Math.min(b, v));

    // DOM refs inside host
    const game = host.querySelector('#game') as HTMLDivElement;
    const hudScore = host.querySelector('#score') as HTMLElement;
    const hudSpeed = host.querySelector('#speed') as HTMLElement;
    const hudBest = host.querySelector('#best') as HTMLElement;
    const ents = host.querySelector('#entities') as HTMLDivElement;
    const track = host.querySelector('#track') as HTMLDivElement;
    const overlay = host.querySelector('#overlay') as HTMLDivElement;
    const toast = host.querySelector('#go-toast') as HTMLDivElement;
    const menu = host.querySelector('#menu') as HTMLDivElement;
    const btnStart = host.querySelector('#menu-start') as HTMLButtonElement;
    const btnTry = host.querySelector('#btn-try') as HTMLButtonElement;
    const btnMenu = host.querySelector('#btn-menu') as HTMLButtonElement;

    // Config (original FR-1.0.8)
    const GW=900, GH=600, LANE_COUNT=5, LANE_W=GW/LANE_COUNT;
    const BASE_SCROLL_SPEED=220, PLAYER_SPEED_X=520;
    const OB_MIN=0.42, OB_MAX=0.95, BONUS_CH=0.35;
    const MIN_VERT_GAP_PX = 120;

    // Score keeping
    const KEY='flameRacer.highscores';
    const load=()=>{ try{ return JSON.parse(localStorage.getItem(KEY)||'[]') }catch{ return [] } };
    const save=(s:number)=>{ const a=load(); a.push(Math.floor(s)); a.sort((x:number,y:number)=>y-x); localStorage.setItem(KEY, JSON.stringify(a.slice(0,10))); };
    const refreshBest=()=>{ const a=load(); hudBest.textContent=(a[0]||0).toString(); };

    // Entities
    class E { x:number; y:number; w:number; h:number; dead:boolean; el:HTMLDivElement; constructor(cls:string,x:number,y:number,w:number,h:number){ this.x=x; this.y=y; this.w=w; this.h=h; this.dead=false; this.el=document.createElement('div'); this.el.className=cls; this.draw(); ents.appendChild(this.el); }
      draw(){ this.el.style.transform=`translate3d(${this.x}px, ${this.y}px, 0)`; this.el.style.width=this.w+'px'; this.el.style.height=this.h+'px'; }
      destroy(){ this.el.remove(); }
      get rect(){ return { x:this.x, y:this.y, w:this.w, h:this.h }; } }
    const hit=(a:any,b:any)=> a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;

    class P extends E { vx:number; constructor(){ super('player', GW*0.5-21, GH-110, 42, 60); this.vx=0; const img=document.createElement('img'); img.src='/lovable-uploads/4a1807b9-ae14-4689-80c9-18c8258f160f.png'; img.alt='Flame'; this.el.appendChild(img); }
      update(dt:number,i:{left:boolean;right:boolean}){ const dir=(i.right?1:0)-(i.left?1:0); this.vx=dir*PLAYER_SPEED_X; this.x=clamp(this.x+this.vx*dt,0,GW-this.w); this.draw(); } }

    class O extends E { vy:number; constructor(l:number,w:number,s:number){ const W=LANE_W*w-10, H=46+Math.random()*18; super('obstacle', l*LANE_W+5, -H, W, H); this.vy=s; }
      update(dt:number){ this.y+=this.vy*dt; if(this.y>GH+50) this.dead=true; this.draw(); } }
    class B extends E { vy:number; constructor(l:number,s:number){ super('bonus', l*LANE_W+(LANE_W-26)/2, -26, 26, 26); this.vy=s*0.9; }
      update(dt:number){ this.y+=this.vy*dt; if(this.y>GH+50) this.dead=true; this.draw(); } }

    // Game
    class G{
      p:P; obs:O[]; bons:B[]; time:number; score:number; speed:number; timer:number; safe:number; input:{left:boolean;right:boolean}; running:boolean; last:number;
      constructor(){ this.p=new P(); this.obs=[]; this.bons=[]; this.time=0; this.score=0; this.speed=BASE_SCROLL_SPEED; this.timer=0; this.safe=Math.floor(LANE_COUNT/2); this.input={left:false,right:false}; this.running=false; this.last=performance.now(); this._bind(); this._stripes(); this._resize(); addEventListener('resize',()=>this._resize()); refreshBest(); this._hud(); }
      _bind(){
        addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') this.input.left=true; if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') this.input.right=true; if(e.key==='Enter'){ if(!this.running) this.start(); } if(e.key==='r'||e.key==='R'){ if(!this.running) this.restart(); } });
        addEventListener('keyup',e=>{ if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') this.input.left=false; if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') this.input.right=false; });
        btnStart?.addEventListener('click',()=>this.start());
        btnTry?.addEventListener('click',()=>this.restart());
        btnMenu?.addEventListener('click',()=>{ this.stop(); overlay.classList.remove('show'); overlay.style.opacity='0'; (menu as any).classList.remove('hidden'); });
      }
      _stripes(){ track.innerHTML=''; const n=4; for(let i=1;i<=n;i++){ const s=document.createElement('div'); s.className='stripe'; s.style.position='absolute'; s.style.left='0'; s.style.right='0'; s.style.height='2px'; s.style.opacity='0.6'; s.style.top=(i*(GH/(n+1)))+'px'; s.style.background='linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)'; track.appendChild(s); } }
      _resize(){ const pad=16, scale=Math.min((innerWidth-pad)/GW,(innerHeight-pad)/GH); (game as any).style.transform=`scale(${scale})`; }
      _hud(){ hudScore.textContent=Math.floor(this.score).toString(); hudSpeed.textContent=(this.speed/BASE_SCROLL_SPEED).toFixed(2)+'×'; }
      start(){ if(this.running) return; (menu as any).classList.add('hidden'); (toast as any).hidden=true; overlay.classList.remove('show'); overlay.style.opacity='0'; this.running=true; this.last=performance.now(); this.loop(); }
      stop(){ this.running=false; }
      restart(){ this.stop(); this.p.destroy(); this.reset(); (toast as any).hidden=true; overlay.classList.remove('show'); overlay.style.opacity='0'; this.start(); }
      reset(){ this.p=new P(); this.obs=[]; this.bons=[]; ents.innerHTML=''; ents.appendChild(this.p.el); this.time=0; this.score=0; this.speed=BASE_SCROLL_SPEED; this.timer=0; this.safe=Math.floor(LANE_COUNT/2); this._hud(); refreshBest(); }
      _spawn(){
        if(this.safe==null) this.safe=Math.floor(LANE_COUNT/2);
        const corridor=this.time<20?2:1;
        const delta=(-1+((Math.random()*3)|0));
        let next=Math.max(0, Math.min(LANE_COUNT-corridor, this.safe+delta));
        const free=new Array(LANE_COUNT).fill(true);
        for(let i=0;i<corridor;i++) free[next+i]=false;
        const s=this.speed; let i=0, placed=0, streak=0;
        while(i<LANE_COUNT){
          if(!free[i]){ streak=0; i++; continue; }
          const two=(Math.random()<0.22)&& i+1<LANE_COUNT && free[i+1] && streak<1;
          const w=two?2:1;
          if(streak+w>=3){ streak=0; i++; continue; }
          this.obs.push(new O(i,w,s));
          for(let k=0;k<w;k++) free[i+k]=false;
          placed++; streak+=w; i += w + (Math.random()<0.15?1:0); if(placed>=3) break;
        }
        if(Math.random()<BONUS_CH){ const lane = next + (corridor>1 && Math.random()<0.5 ? 1 : 0); this.bons.push(new B(lane, s)); }
        this.safe=next;
      }
      loop(){ if(!this.running) return; const now=performance.now(), dt=Math.min((now-this.last)/1000, 0.066); this.last=now; this.time+=dt; this.score+=dt*60; this.speed=BASE_SCROLL_SPEED*(1+Math.min(this.time*0.03,2.2));
        this.timer -= dt; if(this.timer<=0){ this._spawn(); let nextT = OB_MIN + Math.random()*(OB_MAX-OB_MIN); nextT /= (1 + Math.min(this.time*0.02, 1.4)); const minGapT = MIN_VERT_GAP_PX / this.speed; this.timer = Math.max(nextT, minGapT); }
        this.p.update(dt,this.input); for(const o of this.obs) o.update(dt); for(const b of this.bons) b.update(dt);
        for(const o of this.obs){ if(hit(this.p.rect,o.rect)) return this.gameOver(); }
        for(const b of this.bons){ if(!b.dead && hit(this.p.rect,b.rect)){ b.dead=true; b.destroy(); this.score+=50; } }
        this.obs=this.obs.filter(o=>!o.dead); this.bons=this.bons.filter(b=>!b.dead); this._hud(); requestAnimationFrame(()=>this.loop()); }
      gameOver(){ this.stop(); save(this.score); refreshBest(); (host.querySelector('#final-score') as HTMLElement).textContent=Math.floor(this.score).toString(); (toast as any).hidden=false; overlay.classList.add('show'); overlay.style.opacity='1'; }
    }

    // Start engine
    const engine = new G();
    (menu as any).classList.remove('hidden'); overlay.classList.remove('show'); overlay.style.opacity='0';

    const onResize = () => { const scale = Math.min((window.innerWidth-16)/900,(window.innerHeight-16)/600); (game as any).style.transform=`scale(${scale})`; };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      host.innerHTML = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div ref={hostRef} className="relative w-[900px] h-[600px] mx-auto rounded-3xl game-surface overflow-hidden" />
    </div>
  );
};
