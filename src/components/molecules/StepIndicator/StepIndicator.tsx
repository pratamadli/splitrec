import { cn } from '@/src/lib/cn'

type StepStatus = 'done' | 'active' | 'pending'

interface Step {
  number: number
  label: string
  status: StepStatus
}

interface StepIndicatorProps {
  participantCount: number
  hasTransactions: boolean
  currentStep: 1 | 2 | 3
}

function computeSteps(participantCount: number, hasTransactions: boolean, currentStep: 1 | 2 | 3): Step[] {
  const getStatus = (stepNum: number): StepStatus => {
    if (stepNum === currentStep) return 'active'
    if (stepNum < currentStep) return 'done'
    if (stepNum === 2 && hasTransactions) return 'done'
    return 'pending'
  }

  return [
    { number: 1, label: 'Peserta', status: getStatus(1) },
    { number: 2, label: 'Transaksi', status: getStatus(2) },
    { number: 3, label: 'Hasil', status: getStatus(3) },
  ]
}

export function StepIndicator({ participantCount, hasTransactions, currentStep }: StepIndicatorProps) {
  const steps = computeSteps(participantCount, hasTransactions, currentStep)

  return (
    <div className="flex items-center justify-center px-4 py-3 bg-white border-b border-gray-100">
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                step.status === 'done' && 'bg-brand-blue text-white',
                step.status === 'active' && 'border-2 border-brand-blue text-brand-blue',
                step.status === 'pending' && 'border-2 border-gray-300 text-gray-400'
              )}
            >
              {step.status === 'done' ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                step.status === 'pending' ? 'text-gray-400' : 'text-brand-blue'
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'h-0.5 w-10 mx-2 mb-4 rounded',
                steps[idx].status === 'done' ? 'bg-brand-blue' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
