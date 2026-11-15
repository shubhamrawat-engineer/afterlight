import{_ as e,d as LinkComponent,g as n,i as r,n as i,p as a,r as o}from"./index-Caqz24Pb.js";import{t as s}from"./arrow-right--8XEgQfe.js";import{t as c}from"./sparkles-DzJ4r12z.js";import{n as l,t as u}from"./orbit-lFz9R1VL.js";import{t as d}from"./Button-B-x4KLjt.js";import{t as f}from"./bot-DByi6VtL.js";import{t as p}from"./Input-Vd1KQUdQ.js";var m=e(n(),1),h=o();function g({className:e=``,mousePos:t}){let n=(0,m.useRef)(null),r=(0,m.useRef)([]),i=(0,m.useRef)(null),a=(0,m.useRef)({x:0,y:0}),o=(0,m.useRef)({x:0,y:0});return(0,m.useEffect)(()=>{a.current={x:t.x*24,y:t.y*18}},[t]),(0,m.useEffect)(()=>{let e=n.current;if(!e)return;let t=e.getContext(`2d`);if(!t)return;let s=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,c=()=>{let n=e.getBoundingClientRect(),i=Math.min(window.devicePixelRatio||1,2);e.width=n.width*i,e.height=n.height*i,t.scale(i,i);let a=Math.floor(n.width*n.height/7500),o=[`#ffffff`,`#e0f2fe`,`#bae6fd`,`#93c5fd`,`#fef08a`,`#fbcfe8`],s=[];for(let e=0;e<a;e++){let e=Math.random()<.6?1:Math.random()<.85?2:3,t=o[Math.floor(Math.random()*o.length)],r=e===1?Math.random()*.9+.5:e===2?Math.random()*1.2+.8:Math.random()*1.6+1.2,i=e===1?Math.random()*.4+.2:e===2?Math.random()*.5+.4:Math.random()*.4+.6;s.push({x:Math.random()*n.width,y:Math.random()*n.height,size:r,baseAlpha:i,alpha:i,twinkleSpeed:(Math.random()*.02+.008)*(Math.random()<.5?1:-1),color:t,depth:e,hasSpikes:e===3&&Math.random()<.25})}r.current=s};c(),window.addEventListener(`resize`,c);let l=()=>{if(!t||!e)return;let n=e.getBoundingClientRect(),c=n.width,u=n.height;s||(o.current.x+=(a.current.x-o.current.x)*.05,o.current.y+=(a.current.y-o.current.y)*.05),t.clearRect(0,0,c,u);let d=o.current.x,f=o.current.y,p=r.current;for(let e=0;e<p.length;e++){let n=p[e];s||(n.alpha+=n.twinkleSpeed,(n.alpha>n.baseAlpha+.3||n.alpha<n.baseAlpha-.2)&&(n.twinkleSpeed=-n.twinkleSpeed));let r=n.depth*.35,i=n.x+d*r,a=n.y+f*r;if(i<0&&(i+=c),i>c&&(i-=c),a<0&&(a+=u),a>u&&(a-=u),t.fillStyle=n.color,t.globalAlpha=Math.max(.1,Math.min(1,n.alpha)),t.beginPath(),t.arc(i,a,n.size,0,Math.PI*2),t.fill(),n.hasSpikes&&n.alpha>.6){t.strokeStyle=n.color,t.lineWidth=.5,t.globalAlpha=n.alpha*.45;let e=n.size*3.5;t.beginPath(),t.moveTo(i-e,a),t.lineTo(i+e,a),t.moveTo(i,a-e),t.lineTo(i,a+e),t.stroke()}}t.globalAlpha=1,s||(i.current=requestAnimationFrame(l))};return s?l():i.current=requestAnimationFrame(l),()=>{window.removeEventListener(`resize`,c),i.current!==null&&cancelAnimationFrame(i.current)}},[]),(0,h.jsx)(`canvas`,{ref:n,className:`pointer-events-none absolute inset-0 h-full w-full ${e}`,"aria-hidden":`true`})}function _({className:e}){
  let[t,n]=(0,m.useState)({x:0,y:0}),
  [isGalaxyOpen,setIsGalaxyOpen]=(0,m.useState)(!1),
  [galaxyFilter,setGalaxyFilter]=(0,m.useState)(`composite`),
  r=(0,m.useCallback)(e=>{let t=e.currentTarget.getBoundingClientRect(),r=(e.clientX-t.left)/t.width*2-1,i=(e.clientY-t.top)/t.height*2-1;n({x:r,y:i})},[]),
  i=(0,m.useCallback)(()=>{n({x:0,y:0})},[]);
  return(0,h.jsxs)(`section`,{"aria-label":`AFTERLIGHT Observatory Hero`,onMouseMove:r,onMouseLeave:i,className:`relative w-full overflow-hidden bg-[#070B14] min-h-[620px] sm:min-h-[680px] lg:min-h-[760px] flex items-center justify-center ${e??``}`,children:[
    (0,h.jsxs)(`div`,{className:`absolute inset-0 z-0 overflow-hidden`,children:[
      (0,h.jsx)(g,{mousePos:t,className:`z-10 pointer-events-none`}),
      (0,h.jsx)(`div`,{className:`absolute inset-0 z-0 pointer-events-none`,style:{background:`radial-gradient(circle at 66% 42%, rgba(69, 213, 242, 0.22) 0%, rgba(67, 136, 255, 0.16) 28%, rgba(155, 140, 255, 0.09) 52%, transparent 74%), radial-gradient(circle at 22% 60%, rgba(67, 136, 255, 0.12) 0%, rgba(16, 26, 43, 0.28) 45%, transparent 72%), radial-gradient(circle at 82% 24%, rgba(209, 123, 219, 0.12) 0%, transparent 48%)`}}),
      (0,h.jsxs)(`div`,{
        onClick:()=>setIsGalaxyOpen(!0),
        title:`Click to Open Deep-Field Galaxy Core`,
        className:`absolute inset-0 h-full w-full transition-transform duration-500 ease-out cursor-pointer group pointer-events-auto`,
        style:{transform:`translate3d(${t.x*-12}px, ${t.y*-8}px, 0) scale(1.04)`},
        children:[
          (0,h.jsx)(`img`,{
            src:`/assets/galaxy.png`,
            alt:``,
            loading:`eager`,
            fetchPriority:`high`,
            className:`h-full w-full object-cover object-[62%_44%] sm:object-[60%_45%] lg:object-[58%_45%] opacity-95 contrast-[1.16] brightness-[1.14] saturate-[1.28] group-hover:scale-[1.03] transition-all duration-700`,
            style:{
              maskImage:`radial-gradient(ellipse 92% 84% at 62% 45%, black 38%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,0.35) 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 84%, transparent 100%)`,
              WebkitMaskImage:`radial-gradient(ellipse 92% 84% at 62% 45%, black 38%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,0.35) 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 84%, transparent 100%)`,
              maskComposite:`intersect`,
              WebkitMaskComposite:`destination-in`
            }
          }),
          (0,h.jsxs)(`div`,{
            className:`absolute top-[38%] right-[8%] sm:right-[16%] lg:right-[22%] flex flex-col items-center gap-2 pointer-events-auto z-30 transition-transform duration-300 group-hover:scale-110`,
            children:[
              (0,h.jsxs)(`div`,{
                className:`relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-950/90 text-cyan-300 shadow-[0_0_30px_rgba(69,213,242,0.8)] animate-pulse`,
                children:[
                  (0,h.jsx)(u,{className:`h-5 w-5 text-cyan-300`}),
                  (0,h.jsx)(`span`,{className:`absolute -inset-1 rounded-full border border-cyan-400/60 animate-ping opacity-75`})
                ]
              }),
              (0,h.jsxs)(`div`,{
                className:`flex flex-col items-center rounded-xl border border-cyan-400/50 bg-[#070B14]/90 px-3.5 py-1.5 backdrop-blur-md shadow-2xl text-center`,
                children:[
                  (0,h.jsx)(`span`,{className:`text-xs font-bold text-cyan-300 tracking-wide`,children:`✨ Click to Open Galaxy`}),
                  (0,h.jsx)(`span`,{className:`text-[10px] font-mono text-slate-400`,children:`COSMOS Deep Field Core`})
                ]
              })
            ]
          })
        ]
      }),
      (0,h.jsx)(`div`,{className:`pointer-events-none absolute inset-0 z-20`,style:{background:`radial-gradient(ellipse 68% 72% at 24% 50%, rgba(7, 11, 20, 0.72) 0%, rgba(7, 11, 20, 0.42) 52%, transparent 86%), linear-gradient(180deg, rgba(7, 11, 20, 0.55) 0%, transparent 22%, transparent 74%, #070B14 100%)`}})
    ]}),
    (0,h.jsx)(`div`,{className:`relative z-30 mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-22`,style:{maxWidth:`var(--content-max-width)`},children:(0,h.jsxs)(`div`,{className:`max-w-2xl sm:max-w-3xl space-y-6`,children:[
      (0,h.jsxs)(`div`,{className:`inline-flex items-center gap-2.5 rounded-full border border-[#24344D] bg-[#0A1020]/85 px-4 py-1.5 text-xs font-medium tracking-[0.06em] text-[#45D5F2] backdrop-blur-md shadow-[0_6px_24px_rgba(3,6,14,0.45)]`,children:[
        (0,h.jsxs)(`span`,{className:`relative flex h-2 w-2`,children:[(0,h.jsx)(`span`,{className:`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45D5F2] opacity-70`}),(0,h.jsx)(`span`,{className:`relative inline-flex rounded-full h-2 w-2 bg-[#45D5F2]`})]}),
        (0,h.jsx)(`span`,{children:`The Universe Leaves Clues`}),
        (0,h.jsx)(`span`,{className:`text-[#324869]`,children:`•`}),
        (0,h.jsx)(`span`,{className:`text-[#B5C2D6] hidden sm:inline`,children:`NASA SPHEREx Multi-Epoch Platform`})
      ]}),
      (0,h.jsxs)(`h1`,{className:`text-hero-heading text-[#F4F7FF] drop-shadow-[0_4px_28px_rgba(3,6,14,0.65)] font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight`,children:[
        `Explore. Analyse. `,
        (0,h.jsx)(`span`,{className:`block mt-1.5 bg-gradient-to-r from-[#45D5F2] via-[#7EB8FF] to-[#9B8CFF] bg-clip-text text-transparent`,children:`Discover.`})
      ]}),
      (0,h.jsx)(`p`,{className:`text-base sm:text-[17px] text-[#E1E9F7] max-w-xl sm:max-w-2xl leading-relaxed font-normal text-balance drop-shadow-[0_2px_12px_rgba(3,6,14,0.75)]`,children:`Investigate celestial change across real NASA SPHEREx multi-epoch observations with task-specific compatibility checks, defensible photometric uncertainty budgets, and an autonomous discovery sifter for comets, asteroids, variable stars, and candidate planetary worlds.`}),
      (0,h.jsxs)(`div`,{className:`pt-2 flex flex-wrap items-center gap-3.5`,children:[
        (0,h.jsx)(d,{to:`/explore`,variant:`primary`,size:`lg`,className:`bg-gradient-to-r from-[#4388FF] to-[#2F73EB] hover:from-[#5A9BFF] hover:to-[#4388FF] text-[#F4F7FF] font-medium shadow-[0_8px_28px_rgba(67,136,255,0.34)] border border-[#45D5F2]/35 transition-all hover:-translate-y-0.5 cursor-pointer`,rightIcon:(0,h.jsx)(s,{className:`h-4 w-4`}),children:`Start Exploring`}),
        (0,h.jsx)(d,{to:`/objects`,variant:`secondary`,size:`lg`,className:`bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 text-[#F4F7FF] border border-purple-500/50 hover:border-purple-400 backdrop-blur-md shadow-[0_6px_22px_rgba(155,140,255,0.3)] transition-all hover:-translate-y-0.5 cursor-pointer`,leftIcon:(0,h.jsx)(c,{className:`h-4 w-4 text-purple-300`}),children:`Celestial Objects (9)`}),
        (0,h.jsxs)(`button`,{
          onClick:()=>setIsGalaxyOpen(!0),
          className:`px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-500/50 hover:border-cyan-400 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer`,
          children:[
            (0,h.jsx)(u,{className:`h-4 w-4 text-cyan-400`}),
            (0,h.jsx)(`span`,{children:`Inspect Galaxy Core`})
          ]
        })
      ]}),
      (0,h.jsxs)(`div`,{className:`pt-6 sm:pt-7 flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-[#B5C2D6] border-t border-[#24344D]/80 max-w-2xl`,children:[
        (0,h.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,h.jsx)(`span`,{className:`h-2 w-2 rounded-full bg-emerald-400`}),(0,h.jsx)(`span`,{className:`text-emerald-300 font-medium`,children:`NASA Archive Connected`})]}),
        (0,h.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,h.jsx)(`span`,{className:`h-2 w-2 rounded-full bg-[#4388FF]`}),(0,h.jsx)(`span`,{children:`SPHEREx DR1: 102 Spectral Bands`})]}),
        (0,h.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,h.jsx)(`span`,{className:`h-2 w-2 rounded-full bg-amber-400`}),(0,h.jsx)(`span`,{className:`text-[#F4F7FF]`,children:`Multi-Epoch Photometric Baseline`})]})
      ]})
    ]})}),
    isGalaxyOpen&&(0,h.jsx)(`div`,{
      className:`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6 animate-fade-in`,
      onClick:e=>{e.target===e.currentTarget&&setIsGalaxyOpen(!1)},
      children:(0,h.jsxs)(`div`,{
        className:`relative w-full max-w-5xl rounded-3xl border border-cyan-500/40 bg-[#070B14] shadow-[0_0_60px_rgba(69,213,242,0.25)] overflow-hidden flex flex-col max-h-[90vh]`,
        children:[
          (0,h.jsxs)(`div`,{
            className:`flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60`,
            children:[
              (0,h.jsxs)(`div`,{
                className:`flex items-center gap-3`,
                children:[
                  (0,h.jsx)(`div`,{
                    className:`flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400`,
                    children:(0,h.jsx)(u,{className:`h-5 w-5`})
                  }),
                  (0,h.jsxs)(`div`,{
                    children:[
                      (0,h.jsxs)(`h3`,{
                        className:`text-lg font-bold text-white flex items-center gap-2`,
                        children:[
                          `COSMOS Deep-Field Galaxy Core`,
                          (0,h.jsx)(`span`,{
                            className:`px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30`,
                            children:`LIVE INTERACTIVE`
                          })
                        ]
                      }),
                      (0,h.jsx)(`p`,{
                        className:`text-xs text-slate-400 font-mono`,
                        children:`ICRS J2000: RA 150.1005° • Dec +02.2024° • Tangent FOV: 0.25° × 0.25° • z = 0.85`
                      })
                    ]
                  })
                ]
              }),
              (0,h.jsx)(`button`,{
                onClick:()=>setIsGalaxyOpen(!1),
                className:`h-9 w-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer text-base font-bold`,
                children:`✕`
              })
            ]
          }),
          (0,h.jsxs)(`div`,{
            className:`relative flex-1 min-h-[340px] sm:min-h-[420px] bg-black overflow-hidden flex items-center justify-center p-2`,
            children:[
              (0,h.jsx)(`img`,{
                src:galaxyFilter===`3.98`?`/static/demo-deepfield-01/earlier.png`:galaxyFilter===`2.42`?`/static/demo-deepfield-01/later.png`:galaxyFilter===`diff`?`/static/demo-deepfield-01/difference.png`:`/assets/galaxy.png`,
                alt:`COSMOS Galaxy Deep Space View`,
                className:`h-full w-full object-contain rounded-xl transition-all duration-300`
              }),
              (0,h.jsxs)(`div`,{
                className:`absolute top-4 left-4 flex flex-col gap-1 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 text-xs font-mono text-cyan-300`,
                children:[
                  (0,h.jsx)(`span`,{className:`font-semibold text-white`,children:`Active Telescope Passband:`}),
                  (0,h.jsx)(`span`,{
                    children:galaxyFilter===`3.98`?`SPHEREx Band 5 (3.98 μm DR1 Tangent)`:galaxyFilter===`2.42`?`SPHEREx Band 3 (2.42 μm Multi-Epoch)`:galaxyFilter===`diff`?`Photometric Difference Map (ΔF = +0.32 mJy)`:`Multi-Wavelength Cosmic Spiral Overview`
                  })
                ]
              })
            ]
          }),
          (0,h.jsxs)(`div`,{
            className:`border-t border-slate-800 p-5 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4`,
            children:[
              (0,h.jsxs)(`div`,{
                className:`flex flex-wrap items-center gap-2`,
                children:[
                  (0,h.jsx)(`span`,{className:`text-xs font-semibold text-slate-400 mr-1`,children:`Passbands:`}),
                  (0,h.jsx)(`button`,{
                    onClick:()=>setGalaxyFilter(`composite`),
                    className:`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${galaxyFilter===`composite`?`bg-cyan-950 border-cyan-400 text-cyan-200 font-bold`:`bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white`}`,
                    children:`✨ Composite`
                  }),
                  (0,h.jsx)(`button`,{
                    onClick:()=>setGalaxyFilter(`3.98`),
                    className:`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${galaxyFilter===`3.98`?`bg-cyan-950 border-cyan-400 text-cyan-200 font-bold`:`bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white`}`,
                    children:`🔴 3.98 μm`
                  }),
                  (0,h.jsx)(`button`,{
                    onClick:()=>setGalaxyFilter(`2.42`),
                    className:`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${galaxyFilter===`2.42`?`bg-cyan-950 border-cyan-400 text-cyan-200 font-bold`:`bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white`}`,
                    children:`🔵 2.42 μm`
                  }),
                  (0,h.jsx)(`button`,{
                    onClick:()=>setGalaxyFilter(`diff`),
                    className:`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${galaxyFilter===`diff`?`bg-cyan-950 border-cyan-400 text-cyan-200 font-bold`:`bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white`}`,
                    children:`⚡ Diff Map`
                  })
                ]
              }),
              (0,h.jsxs)(`div`,{
                className:`flex flex-wrap items-center gap-2.5`,
                children:[
                  (0,h.jsxs)(LinkComponent,{
                    to:`/temporal-analysis/demo-deepfield-01`,
                    className:`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm`,
                    children:[(0,h.jsx)(`span`,{children:`Temporal Lab`}),(0,h.jsx)(s,{className:`h-3.5 w-3.5`})]
                  }),
                  (0,h.jsxs)(LinkComponent,{
                    to:`/spectral-lab/demo-deepfield-01`,
                    className:`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-600 hover:bg-cyan-900 transition-colors`,
                    children:[(0,h.jsx)(`span`,{children:`Spectral Lab`}),(0,h.jsx)(s,{className:`h-3.5 w-3.5`})]
                  }),
                  (0,h.jsxs)(LinkComponent,{
                    to:`/objects`,
                    className:`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/80 border border-purple-600 hover:bg-purple-900 transition-colors`,
                    children:[(0,h.jsx)(`span`,{children:`Sifted Objects (9)`}),(0,h.jsx)(s,{className:`h-3.5 w-3.5`})]
                  })
                ]
              })
            ]
          })
        ]
      })
    })
  ]})
}var v=[{id:`universe-explorer`,title:`Universe Explorer`,description:`Navigate 7 SPHEREx deep fields with interactive pan-zoom astrometric cutouts.`,href:`/explore`,visualType:`orbit`,ariaLabel:`Open Universe Explorer interactive sky maps`},{id:`temporal-analysis`,title:`Temporal Analysis`,description:`Compare multi-epoch observation pairs with pixel-by-pixel difference subtraction.`,href:`/temporal-analysis/demo-deepfield-01`,visualType:`temporal`,ariaLabel:`Open Temporal Analysis observation comparison`},{id:`spectral-lab`,title:`Spectral Lab`,description:`Inspect 102 continuous infrared spectrophotometric channels from 0.75 to 5.00 μm.`,href:`/spectral-lab/demo-deepfield-01`,visualType:`spectral`,ariaLabel:`Open Spectral Lab wavelength explorer`},{id:`object-intelligence`,title:`Object Intelligence`,description:`Autonomous discovery dossiers for comets, asteroids, brown dwarfs & candidate worlds.`,href:`/objects`,visualType:`intelligence`,ariaLabel:`Open Object Intelligence celestial dossiers`}];var y=[{id:`q1`,text:`What are black holes?`},{id:`q2`,text:`Why do galaxies glow?`},{id:`q3`,text:`Tell me about SPHEREx`}];function b({type:e}){
  switch(e){
    case`orbit`:
      return (0,h.jsxs)(`div`,{
        className:`relative h-full w-full overflow-hidden flex items-center justify-center bg-black`,
        children:[
          (0,h.jsx)(`img`,{
            src:`/assets/galaxy.png`,
            alt:`Universe Starfield Preview`,
            className:`absolute inset-0 h-full w-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700 ease-out`,
            loading:`lazy`
          }),
          (0,h.jsx)(`div`,{
            className:`absolute inset-0 bg-gradient-to-t from-[#080E1C] via-[#080E1C]/40 to-transparent pointer-events-none`
          }),
          (0,h.jsxs)(`svg`,{
            viewBox:`0 0 200 120`,
            className:`absolute inset-0 h-full w-full z-10 pointer-events-none`,
            fill:`none`,
            xmlns:`http://www.w3.org/2000/svg`,
            children:[
              (0,h.jsx)(`ellipse`,{cx:`100`,cy:`60`,rx:`78`,ry:`36`,stroke:`#38bdf8`,strokeOpacity:`0.4`,strokeWidth:`1`,strokeDasharray:`3 3`}),
              (0,h.jsx)(`ellipse`,{cx:`100`,cy:`60`,rx:`58`,ry:`22`,transform:`rotate(-12 100 60)`,stroke:`#60a5fa`,strokeOpacity:`0.6`,strokeWidth:`1.2`}),
              (0,h.jsx)(`circle`,{cx:`100`,cy:`60`,r:`18`,fill:`#38bdf8`,fillOpacity:`0.15`}),
              (0,h.jsx)(`circle`,{cx:`100`,cy:`60`,r:`5`,fill:`#38bdf8`}),
              (0,h.jsx)(`circle`,{cx:`100`,cy:`60`,r:`2`,fill:`#ffffff`}),
              (0,h.jsx)(`circle`,{cx:`152`,cy:`50`,r:`3`,fill:`#60a5fa`,className:`animate-pulse`}),
              (0,h.jsx)(`circle`,{cx:`48`,cy:`68`,r:`2.5`,fill:`#93c5fd`})
            ]
          }),
          (0,h.jsxs)(`div`,{
            className:`absolute top-2 left-2 z-20 flex items-center gap-1.5 rounded bg-[#070B14]/85 px-2 py-0.5 text-[9px] font-mono font-semibold text-cyan-300 border border-cyan-500/40 backdrop-blur-md`,
            children:[(0,h.jsx)(`span`,{className:`h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping`}),(0,h.jsx)(`span`,{children:`ALL-SKY • 7 TARGETS`})]
          }),
          (0,h.jsx)(`div`,{
            className:`absolute bottom-2 right-2 z-20 text-[9px] font-mono text-cyan-300/80 drop-shadow`,
            children:`RA 150.1° • Dec +2.2°`
          })
        ]
      });

    case`temporal`:
      return (0,h.jsxs)(`div`,{
        className:`relative h-full w-full overflow-hidden flex items-center justify-center bg-black`,
        children:[
          (0,h.jsx)(`img`,{
            src:`/static/demo-deepfield-01/earlier.png`,
            alt:`SPHEREx Epoch 1 Frame`,
            className:`absolute inset-0 h-full w-full object-cover opacity-65 group-hover:scale-105 group-hover:opacity-85 transition-all duration-700 ease-out`,
            loading:`lazy`
          }),
          (0,h.jsx)(`div`,{
            className:`absolute inset-0 bg-gradient-to-t from-[#080E1C] via-transparent to-[#080E1C]/60 pointer-events-none`
          }),
          (0,h.jsxs)(`div`,{
            className:`absolute top-2 right-2 z-20 w-16 h-12 rounded-lg overflow-hidden border border-cyan-400/60 shadow-[0_0_12px_rgba(69,213,242,0.5)] group-hover:scale-110 transition-transform duration-300`,
            children:[
              (0,h.jsx)(`img`,{src:`/static/demo-deepfield-01/difference.png`,alt:`Diff Map`,className:`w-full h-full object-cover`}),
              (0,h.jsx)(`div`,{className:`absolute bottom-0 inset-x-0 bg-cyan-950/90 text-[7px] font-mono text-cyan-300 text-center py-0.2`,children:`DIFF MAP`})
            ]
          }),
          (0,h.jsxs)(`div`,{
            className:`absolute left-[40%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-15 pointer-events-none`,
            children:[
              (0,h.jsx)(`span`,{className:`absolute h-9 w-9 rounded-full border border-cyan-400 animate-ping opacity-75`}),
              (0,h.jsx)(`span`,{className:`h-5 w-5 rounded-full border-2 border-cyan-300 bg-cyan-400/25`}),
              (0,h.jsx)(`span`,{className:`h-1.5 w-1.5 rounded-full bg-white`}),
              (0,h.jsx)(`span`,{className:`absolute -bottom-5 text-[8px] font-mono text-cyan-200 whitespace-nowrap bg-black/85 px-1.5 py-0.5 rounded border border-cyan-500/50 shadow`,children:`ΔF = +0.32 mJy`})
            ]
          }),
          (0,h.jsxs)(`div`,{
            className:`absolute top-2 left-2 z-20 flex items-center gap-1.5 rounded bg-blue-950/85 px-2 py-0.5 text-[9px] font-mono font-semibold text-blue-300 border border-blue-500/40 backdrop-blur-md`,
            children:[(0,h.jsx)(`span`,{className:`h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse`}),(0,h.jsx)(`span`,{children:`EPOCH 1 ↔ EPOCH 2`})]
          }),
          (0,h.jsx)(`div`,{
            className:`absolute bottom-2 left-2 z-20 text-[9px] font-mono text-slate-400 drop-shadow`,
            children:`Baseline: 185 Days`
          })
        ]
      });

    case`spectral`:
      return (0,h.jsxs)(`div`,{
        className:`relative h-full w-full overflow-hidden flex items-center justify-center bg-black`,
        children:[
          (0,h.jsx)(`img`,{
            src:`/static/demo-deepfield-01/later.png`,
            alt:`SPHEREx Infrared Emission Field`,
            className:`absolute inset-0 h-full w-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700 ease-out`,
            loading:`lazy`
          }),
          (0,h.jsx)(`div`,{
            className:`absolute inset-0 bg-gradient-to-t from-[#080E1C] via-[#080E1C]/60 to-purple-950/40 pointer-events-none`
          }),
          (0,h.jsxs)(`svg`,{
            viewBox:`0 0 200 120`,
            className:`absolute inset-0 h-full w-full z-10 pointer-events-none`,
            fill:`none`,
            xmlns:`http://www.w3.org/2000/svg`,
            children:[
              (0,h.jsxs)(`defs`,{
                children:[
                  (0,h.jsxs)(`linearGradient`,{
                    id:`specLineGrad2`,
                    x1:`0%`,
                    y1:`0%`,
                    x2:`100%`,
                    y2:`0%`,
                    children:[
                      (0,h.jsx)(`stop`,{offset:`0%`,stopColor:`#38bdf8`}),
                      (0,h.jsx)(`stop`,{offset:`40%`,stopColor:`#818cf8`}),
                      (0,h.jsx)(`stop`,{offset:`70%`,stopColor:`#c084fc`}),
                      (0,h.jsx)(`stop`,{offset:`100%`,stopColor:`#f472b6`})
                    ]
                  }),
                  (0,h.jsxs)(`linearGradient`,{
                    id:`specAreaGrad2`,
                    x1:`0%`,
                    y1:`0%`,
                    x2:`0%`,
                    y2:`100%`,
                    children:[
                      (0,h.jsx)(`stop`,{offset:`0%`,stopColor:`#818cf8`,stopOpacity:`0.4`}),
                      (0,h.jsx)(`stop`,{offset:`100%`,stopColor:`#080E1C`,stopOpacity:`0`})
                    ]
                  })
                ]
              }),
              (0,h.jsx)(`path`,{
                d:`M 20 95 C 40 93, 50 85, 60 70 C 66 58, 68 35, 74 32 C 80 29, 86 65, 96 78 C 106 90, 115 84, 122 65 C 126 55, 128 38, 134 36 C 140 34, 146 65, 156 82 C 166 94, 172 93, 180 95 L 180 95 L 20 95 Z`,
                fill:`url(#specAreaGrad2)`
              }),
              (0,h.jsx)(`path`,{
                d:`M 20 95 C 40 93, 50 85, 60 70 C 66 58, 68 35, 74 32 C 80 29, 86 65, 96 78 C 106 90, 115 84, 122 65 C 126 55, 128 38, 134 36 C 140 34, 146 65, 156 82 C 166 94, 172 93, 180 95`,
                stroke:`url(#specLineGrad2)`,
                strokeWidth:`2.2`,
                strokeLinecap:`round`
              }),
              (0,h.jsx)(`circle`,{cx:`74`,cy:`32`,r:`3`,fill:`#38bdf8`,className:`animate-ping`}),
              (0,h.jsx)(`circle`,{cx:`74`,cy:`32`,r:`2`,fill:`#ffffff`}),
              (0,h.jsx)(`circle`,{cx:`134`,cy:`36`,r:`3`,fill:`#c084fc`,className:`animate-ping`}),
              (0,h.jsx)(`circle`,{cx:`134`,cy:`36`,r:`2`,fill:`#ffffff`})
            ]
          }),
          (0,h.jsxs)(`div`,{
            className:`absolute top-2 left-2 z-20 flex items-center gap-1.5 rounded bg-purple-950/85 px-2 py-0.5 text-[9px] font-mono font-semibold text-purple-300 border border-purple-500/40 backdrop-blur-md`,
            children:[(0,h.jsx)(`span`,{className:`h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse`}),(0,h.jsx)(`span`,{children:`102 BANDS • 0.75 - 5.0 μm`})]
          }),
          (0,h.jsx)(`div`,{
            className:`absolute bottom-2 right-2 z-20 text-[9px] font-mono text-purple-300/80 drop-shadow`,
            children:`CO₂ & H₂O Infrared Lines`
          })
        ]
      });

    case`intelligence`:
      return (0,h.jsxs)(`div`,{
        className:`relative h-full w-full overflow-hidden flex items-center justify-center bg-black`,
        children:[
          (0,h.jsx)(`img`,{
            src:`/static/objects_media/SPX-OBJ-BD-01/epoch1.png`,
            alt:`Celestial Discovery Candidate`,
            className:`absolute inset-0 h-full w-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-90 transition-all duration-700 ease-out`,
            loading:`lazy`
          }),
          (0,h.jsx)(`div`,{
            className:`absolute inset-0 bg-gradient-to-t from-[#080E1C] via-[#080E1C]/35 to-black/40 pointer-events-none`
          }),
          (0,h.jsxs)(`div`,{
            className:`absolute inset-0 flex items-center justify-center z-15 pointer-events-none`,
            children:[
              (0,h.jsxs)(`div`,{
                className:`relative w-28 h-20 border border-dashed border-emerald-400/70 rounded flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]`,
                children:[
                  (0,h.jsx)(`span`,{className:`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400`}),
                  (0,h.jsx)(`span`,{className:`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400`}),
                  (0,h.jsx)(`span`,{className:`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400`}),
                  (0,h.jsx)(`span`,{className:`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400`}),
                  (0,h.jsx)(`div`,{className:`h-3 w-3 rounded-full border border-emerald-300 bg-emerald-400/30 animate-ping`}),
                  (0,h.jsx)(`div`,{className:`h-1.5 w-1.5 rounded-full bg-white`}),
                  (0,h.jsx)(`span`,{className:`absolute -top-4 text-[8px] font-mono font-bold text-emerald-300 bg-black/90 px-1 rounded border border-emerald-500/50`,children:`[+] TARGET ACQUIRED`})
                ]
              })
            ]
          }),
          (0,h.jsxs)(`div`,{
            className:`absolute top-2 left-2 z-20 flex items-center gap-1.5 rounded bg-emerald-950/85 px-2 py-0.5 text-[9px] font-mono font-semibold text-emerald-300 border border-emerald-500/40 backdrop-blur-md`,
            children:[(0,h.jsx)(`span`,{className:`h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse`}),(0,h.jsx)(`span`,{children:`5 CLASSES • 9 OBJECTS`})]
          }),
          (0,h.jsx)(`div`,{
            className:`absolute bottom-2 right-2 z-20 text-[9px] font-mono text-emerald-300/80 drop-shadow`,
            children:`μ = 1.48″/yr Shift`
          })
        ]
      });

    default:
      return null;
  }
}function x({feature:e,className:n}){
  return (0,h.jsxs)(LinkComponent,{
    to:e.href,
    "aria-label":e.ariaLabel,
    className:r(
      `group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-300`,
      `bg-gradient-to-b from-[#0D1527] to-[#070B14] border-[#1E2E4A] hover:border-cyan-400/60 hover:bg-[#101C33]`,
      `hover:-translate-y-1.5 shadow-[0_6px_24px_rgba(3,6,14,0.5)] hover:shadow-[0_16px_36px_rgba(69,213,242,0.18)]`,
      `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45D5F2]`,
      n
    ),
    children:[
      (0,h.jsxs)(`div`,{
        children:[
          (0,h.jsx)(`div`,{
            className:`relative mb-5 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-cyan-500/20 bg-black shadow-inner group-hover:border-cyan-400/50 transition-colors duration-300`,
            children:(0,h.jsx)(b,{type:e.visualType})
          }),
          (0,h.jsx)(`h3`,{
            className:`font-[family-name:var(--font-display)] text-[18px] font-bold tracking-[-0.01em] text-[#F4F7FF] transition-colors duration-200 group-hover:text-[#45D5F2] flex items-center justify-between`,
            children:[
              (0,h.jsx)(`span`,{children:e.title}),
              (0,h.jsx)(`span`,{className:`text-[11px] font-mono font-medium text-cyan-400/70 group-hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity`,children:`ACTIVE`})
            ]
          }),
          (0,h.jsx)(`p`,{
            className:`mt-2 text-[13px] leading-relaxed text-[#B5C2D6]`,
            children:e.description
          })
        ]
      }),
      (0,h.jsxs)(`div`,{
        className:`mt-6 flex items-center justify-between border-t border-[#1A2940] pt-4`,
        children:[
          (0,h.jsxs)(`span`,{
            className:`text-xs font-semibold text-cyan-400/90 transition-colors group-hover:text-cyan-300 flex items-center gap-1.5`,
            children:[
              (0,h.jsx)(`span`,{className:`h-1.5 w-1.5 rounded-full bg-cyan-400 group-hover:animate-ping`}),
              (0,h.jsx)(`span`,{children:`Open Workstation`})
            ]
          }),
          (0,h.jsx)(`div`,{
            className:`flex h-8 w-8 items-center justify-center rounded-lg border border-[#24344D] bg-[#131F33] text-[#B5C2D6] transition-all duration-200 group-hover:border-[#4388FF]/60 group-hover:bg-[#4388FF] group-hover:text-[#F4F7FF] group-hover:scale-105 shadow-sm`,
            children:(0,h.jsx)(l,{className:`h-4 w-4`,"aria-hidden":`true`})
          })
        ]
      })
    ]
  })
}function S({className:e}){return(0,h.jsx)(`section`,{"aria-label":`Core AFTERLIGHT Features`,className:e,children:(0,h.jsx)(`div`,{className:`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5`,children:v.map(e=>(0,h.jsx)(x,{feature:e},e.id))})})}function C({className:e}){let[t,n]=(0,m.useState)(``),r=(0,m.useRef)(null),o=a(),l=e=>{e.preventDefault();let n=t.trim();n&&o(`/ai?q=${encodeURIComponent(n)}`)},u=e=>{o(`/ai?q=${encodeURIComponent(e)}`)};return(0,h.jsx)(`section`,{"aria-label":`Cosmos AI Assistant Query`,className:`rounded-xl border border-[#24344D] bg-[#101A2B] p-6 sm:p-7 shadow-[0_6px_24px_rgba(3,6,14,0.42)] ${e??``}`,children:(0,h.jsxs)(`div`,{className:`flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between`,children:[(0,h.jsxs)(`div`,{className:`flex items-center gap-3.5 lg:min-w-[230px]`,children:[(0,h.jsx)(`div`,{className:`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#4388FF]/35 bg-[#131F33] text-[#45D5F2] shadow-sm`,children:(0,h.jsx)(f,{className:`h-5 w-5`,"aria-hidden":`true`})}),(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`div`,{className:`flex items-center gap-1.5`,children:[(0,h.jsx)(`h2`,{className:`font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-wide text-[#F4F7FF]`,children:`Cosmos AI`}),(0,h.jsx)(c,{className:`h-3.5 w-3.5 text-[#45D5F2]`,"aria-hidden":`true`})]}),(0,h.jsx)(`p`,{className:`text-[13px] text-[#B5C2D6]`,children:`Contextual investigation assistant.`})]})]}),(0,h.jsx)(`form`,{onSubmit:l,className:`flex-1 lg:max-w-xl`,role:`search`,children:(0,h.jsx)(p,{ref:r,type:`text`,inputSize:`lg`,value:t,onChange:e=>n(e.target.value),placeholder:`Ask about candidate targets, compatibility thresholds, or workflow steps...`,"aria-label":`Ask anything about the universe`,rightElement:(0,h.jsx)(i,{type:`submit`,size:`sm`,variant:`active`,disabled:!t.trim(),"aria-label":`Submit astronomical inquiry`,children:(0,h.jsx)(s,{className:`h-4 w-4`})})})}),(0,h.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2 lg:max-w-md lg:justify-end`,children:[(0,h.jsx)(`span`,{className:`mr-1 text-[11px] font-medium tracking-wider text-[#8293AD] uppercase`,children:`Suggested:`}),y.map(e=>(0,h.jsx)(`button`,{type:`button`,onClick:()=>u(e.text),className:`inline-flex h-8 items-center rounded-lg border border-[#24344D] bg-[#131F33] px-3 text-xs font-medium text-[#B5C2D6] transition-colors duration-200 hover:border-[#4388FF]/50 hover:bg-[#192842] hover:text-[#F4F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45D5F2] cursor-pointer`,children:e.text},e.id))]})]})})}function w(){
  return (0,h.jsxs)(`div`,{
    className:`relative min-h-[calc(100vh-var(--navbar-height))] overflow-hidden bg-[#070B14]`,
    children:[
      (0,h.jsx)(_,{}),
      (0,h.jsxs)(`div`,{
        className:`relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2`,
        style:{maxWidth:`var(--content-max-width)`},
        children:[
          (0,h.jsxs)(`div`,{
            className:`grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl text-center`,
            children:[
              (0,h.jsxs)(`div`,{className:`space-y-1 border-r border-slate-800/60 last:border-r-0`,children:[(0,h.jsx)(`div`,{className:`text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400`,children:`1,295,762`}),(0,h.jsx)(`div`,{className:`text-xs text-slate-300 font-medium`,children:`Pixels Evaluated`}),(0,h.jsx)(`div`,{className:`text-[11px] text-cyan-400/80 font-normal`,children:`Scanned points of sky light`})]}),
              (0,h.jsxs)(`div`,{className:`space-y-1 sm:border-r border-slate-800/60 last:border-r-0`,children:[(0,h.jsx)(`div`,{className:`text-2xl sm:text-3xl font-extrabold font-mono text-purple-400`,children:`9 Objects`}),(0,h.jsx)(`div`,{className:`text-xs text-slate-300 font-medium`,children:`Categorized Discoveries`}),(0,h.jsx)(`div`,{className:`text-[11px] text-purple-400/80 font-normal`,children:`Asteroids, stars & worlds`})]}),
              (0,h.jsxs)(`div`,{className:`space-y-1 border-r border-slate-800/60 last:border-r-0`,children:[(0,h.jsx)(`div`,{className:`text-2xl sm:text-3xl font-extrabold font-mono text-blue-400`,children:`102 Bands`}),(0,h.jsx)(`div`,{className:`text-xs text-slate-300 font-medium`,children:`SPHEREx 0.75 - 5.0 μm`}),(0,h.jsx)(`div`,{className:`text-[11px] text-blue-400/80 font-normal`,children:`Infrared heat colors`})]}),
              (0,h.jsxs)(`div`,{className:`space-y-1`,children:[(0,h.jsx)(`div`,{className:`text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400`,children:`99.62%`}),(0,h.jsx)(`div`,{className:`text-xs text-slate-300 font-medium`,children:`Astrometric Overlap`}),(0,h.jsx)(`div`,{className:`text-[11px] text-emerald-400/80 font-normal`,children:`Photo match precision`})]})
            ]
          })
        ]
      }),
      (0,h.jsxs)(`div`,{
        className:`relative z-10 mx-auto flex flex-col gap-12 px-4 sm:px-6 lg:px-8 pb-20 pt-4`,
        style:{maxWidth:`var(--content-max-width)`},
        children:[
          (0,h.jsx)(S,{}),
          (0,h.jsx)(C,{})
        ]
      })
    ]
  });
}
export{w as HomePage};