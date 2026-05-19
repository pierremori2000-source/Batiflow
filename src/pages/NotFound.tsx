import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
        <p className="text-xl text-slate-300 mb-8">Page non trouvée</p>
        <Button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600 text-white">
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFound;