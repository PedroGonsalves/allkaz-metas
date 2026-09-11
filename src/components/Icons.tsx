import { PawPrint, Bird, Dog, Target, Star, Briefcase, Zap, Trophy } from 'lucide-react';
import React from 'react';

export const TeamIcon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ElementType> = {
    paw: PawPrint,
    bird: Bird,
    dog: Dog,
    target: Target,
    star: Star,
    briefcase: Briefcase,
    zap: Zap,
    trophy: Trophy,
  };

  const IconComponent = icons[name] || Star;
  return <IconComponent className={className} />;
};
