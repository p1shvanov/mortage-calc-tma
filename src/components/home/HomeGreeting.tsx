import { memo } from 'react';
import { Section, Placeholder, Text, Avatar } from '@telegram-apps/telegram-ui';

interface HomeGreetingProps {
  greeting: string;
  userPhotoUrl?: string;
  userAcronym?: string;
}

const HomeGreeting = memo(function HomeGreeting({
  greeting,
  userPhotoUrl,
  userAcronym,
}: HomeGreetingProps) {
  return (
    <Section>
      <Placeholder header={greeting}>
        <Text weight="2">
          {(userPhotoUrl || userAcronym) && (
            <Avatar
              size={48}
              src={userPhotoUrl}
              acronym={userAcronym}
            />
          )}
        </Text>
      </Placeholder>
    </Section>
  );
});

export default HomeGreeting;
