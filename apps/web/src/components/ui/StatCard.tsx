import { ReactNode } from 'react';
import { Card, CardContent } from './Card';

export function StatCard({
  label,
  value,
  sub,
  accent = false,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: ReactNode;
  accent?: boolean;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Card className={onClick ? 'cursor-pointer text-left w-full' : ''}>
      <CardContent>
        <Wrapper type={onClick ? 'button' : undefined} onClick={onClick} className="block w-full">
          <p className="text-sm text-app-secondary font-medium">{label}</p>
          <p
            className={`mt-1 text-2xl md:text-3xl font-semibold tracking-tight ${
              accent ? 'text-app-gold' : 'text-app-primary'
            }`}
          >
            {value}
          </p>
          {sub && <div className="mt-1 text-sm text-app-muted">{sub}</div>}
        </Wrapper>
      </CardContent>
    </Card>
  );
}
