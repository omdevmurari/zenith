import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ZenithMap({
  nodes,
  onDragEnd
}: any) {

  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {

    if (!nodes) return;

    const generated = nodes.map((node:any, index:number)=>({

      ...node,

      x: 300 + Math.cos(index * 1.5) * 200,
      y: 200 + Math.sin(index * 1.5) * 200

    }));

    setPositions(generated);

  }, [nodes]);

  const handleDrag = (index:number, x:number, y:number)=>{

    const updated = [...positions];

    updated[index] = {
      ...updated[index],
      x,
      y
    };

    setPositions(updated);

    onDragEnd(updated);

  };

  return (

    <div className="relative w-full h-[500px]">

      {/* Lines */}

      <svg className="absolute w-full h-full">

        {positions.map((node:any, i:number)=>{

          if(i===0) return null;

          const prev = positions[i-1];

          return (

            <line
              key={i}
              x1={prev?.x}
              y1={prev?.y}
              x2={node.x}
              y2={node.y}
              stroke="#1e293b"
              strokeWidth="2"
            />

          );

        })}

      </svg>


      {/* Nodes */}

      {positions.map((node:any,index:number)=> (

        <motion.div

          key={node._id}

          drag

          dragMomentum={false}

          onDragEnd={(e,info)=>{

            handleDrag(
              index,
              info.point.x,
              info.point.y
            );

          }}

          className="absolute"

          style={{
            left: node.x,
            top: node.y
          }}

        >

          <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-lg"/>

          <div className="mt-3 text-xs text-slate-300">

            {node.title}

          </div>

        </motion.div>

      ))}

    </div>

  );

}