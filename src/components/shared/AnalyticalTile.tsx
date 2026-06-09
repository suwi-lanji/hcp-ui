import { Card, CardHeader, FlexBox, Text, Icon } from '@ui5/webcomponents-react';

type KPIState = 'Positive' | 'Negative' | 'Critical' | 'Information' | 'None';

interface SubValue {
  label: string;
  value: string;
}

interface AnalyticalTileProps {
  title: string;
  subtitle?: string;
  kpiValue: string;
  kpiUnit?: string;
  kpiState?: KPIState;
  icon?: string;
  subValues?: SubValue[];
  timeframe?: string;
  onClick?: () => void;
}

const stateColorMap: Record<KPIState, string> = {
  Positive: 'var(--sapPositiveColor, #4db14b)',
  Negative: 'var(--sapNegativeColor, #e0001a)',
  Critical: 'var(--sapCriticalColor, #e9730c)',
  Information: 'var(--sapInformativeColor, #0854a0)',
  None: 'var(--sapTextColor, #333)',
};

export default function AnalyticalTile({
  title,
  subtitle,
  kpiValue,
  kpiUnit,
  kpiState = 'None',
  icon,
  subValues,
  timeframe,
  onClick,
}: AnalyticalTileProps) {
  const color = stateColorMap[kpiState];

  return (
    <Card onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', height: '100%', minHeight: '180px', transition: 'box-shadow 0.15s ease' }} header={<CardHeader titleText={title} subtitleText={subtitle || ''} />}>
      <div style={{ padding: '0.5rem 1rem 0.75rem', display: 'flex', flexDirection: 'column', height: 'calc(100% - 52px)', justifyContent: 'space-between' }}>
        <FlexBox alignItems="Center" justifyContent="SpaceBetween" style={{ marginBottom: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color, lineHeight: 1.1 }}>{kpiValue}</span>
            {kpiUnit && <span style={{ fontSize: '0.875rem', color: 'var(--sapContent_LabelColor, #666)', fontWeight: 500 }}>{kpiUnit}</span>}
          </div>
          {icon && <Icon name={icon} style={{ fontSize: '1.5rem', color: 'var(--sapContent_NonInteractiveIconColor, #8c8c8c)' }} />}
        </FlexBox>
        {subValues && subValues.length > 0 && (
          <div style={{ marginTop: '0.375rem' }}>
            {subValues.map((sv, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.125rem 0', fontSize: '0.8rem' }}>
                <Text style={{ color: 'var(--sapContent_LabelColor, #666)', fontSize: '0.8rem' }}>{sv.label}</Text>
                <Text style={{ fontSize: '0.8rem', fontWeight: 600 }}>{sv.value}</Text>
              </div>
            ))}
          </div>
        )}
        {timeframe && (
          <div style={{ marginTop: '0.5rem', paddingTop: '0.375rem', borderTop: '1px solid var(--sapGroupContentBorderColor, #e5e5e5)', fontSize: '0.75rem', color: 'var(--sapContent_LabelColor, #666)' }}>{timeframe}</div>
        )}
      </div>
    </Card>
  );
}
