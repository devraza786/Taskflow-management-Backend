import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Shield, Rocket } from 'lucide-react';
import Modal from './ui/Modal';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for freelancers',
      features: ['Up to 3 projects', 'Basic analytics', 'Community support'],
      icon: Rocket,
      color: 'bg-slate-100 text-slate-600',
      button: 'Current Plan',
      current: true
    },
    {
      name: 'Professional',
      price: '$29',
      description: 'Best for growing teams',
      features: ['Unlimited projects', 'Advanced AI insights', 'Priority support', 'Custom workflows'],
      icon: Zap,
      color: 'bg-primary-50 text-primary-600',
      button: 'Upgrade Now',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: ['SSO & Security', 'Dedicated account manager', 'SLA guarantees', 'On-premise option'],
      icon: Shield,
      color: 'bg-indigo-50 text-indigo-600',
      button: 'Contact Sales'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Your Plan">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative p-6 rounded-[2rem] border transition-all ${
              plan.popular ? 'border-primary-500 shadow-xl shadow-primary-500/10 bg-white scale-105' : 'border-slate-100 bg-slate-50/50'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                Most Popular
              </span>
            )}
            
            <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center mb-4`}>
              <plan.icon className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-slate-900">{plan.price}</span>
              {plan.price !== 'Custom' && <span className="text-slate-400 text-sm font-bold">/mo</span>}
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">{plan.description}</p>
            
            <div className="mt-6 space-y-3">
              {plan.features.map(feature => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="p-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{feature}</span>
                </div>
              ))}
            </div>
            
            <button 
              className={`w-full mt-8 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                plan.current ? 'bg-slate-200 text-slate-500 cursor-default' : 
                plan.popular ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700' :
                'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-primary-900 rounded-[2rem] text-white flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h4 className="text-lg font-black italic">Special Limited Offer</h4>
          <p className="text-primary-200 text-sm font-medium mt-1">Get 20% off on annual Professional billing. Use code: <span className="text-white font-black underline">TASKFLOW20</span></p>
        </div>
        <Rocket className="w-16 h-16 text-white/10 absolute -right-4 -bottom-4 rotate-12" />
      </div>
    </Modal>
  );
}
