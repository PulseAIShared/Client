import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SimpleCampaignForm } from '@/features/campaigns/components/simple-campaign-form';

export const Component = () => {
  const [searchParams] = useSearchParams();
  const segmentId = searchParams.get('segmentId') || undefined;
  
  return <SimpleCampaignForm segmentId={segmentId} />;
};