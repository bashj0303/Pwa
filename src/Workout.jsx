import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const Workout = ({ t, workouts, setWorkouts }) => {
  const addWorkout = () => {
    const name = prompt(t.exerciseNamePrompt);
    if (!name) return;
    setWorkouts([...workouts, { id: Date.now(), name, weight: 0, reps: '3x10' }]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-white">{t.todaysSession}</h2>
        <button onClick={addWorkout} className="text-[#ccff00] font-bold text-sm bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus size={16} /> {t.exercise}
        </button>
      </div>

      <div className="space-y-3">
        {workouts.map(w => (
          <div key={w.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex justify-between items-center shadow-md">
            <div className="flex-1">
              <input 
                value={w.name}
                onChange={(e) => setWorkouts(workouts.map(x => x.id === w.id ? {...x, name: e.target.value} : x))}
                className="bg-transparent text-white font-bold w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-500 font-bold uppercase">{t.weightLbs}</span>
                <input 
                  type="number"
                  value={w.weight}
                  onChange={(e) => setWorkouts(workouts.map(x => x.id === w.id ? {...x, weight: e.target.value} : x))}
                  className="bg-transparent text-[#ccff00] font-black w-16 text-right focus:outline-none"
                />
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-500 font-bold uppercase">{t.setsReps}</span>
                <input 
                  value={w.reps}
                  onChange={(e) => setWorkouts(workouts.map(x => x.id === w.id ? {...x, reps: e.target.value} : x))}
                  className="bg-transparent text-white font-bold w-12 text-right focus:outline-none"
                />
              </div>
              <button onClick={() => setWorkouts(workouts.filter(x => x.id !== w.id))} className="ml-2 text-slate-600 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workout;
