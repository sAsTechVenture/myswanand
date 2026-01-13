'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { colors } from '@/config/theme';
import { Mail, Phone, MapPin, Edit } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/image-utils';

interface PersonalDetailsProps {
  user: {
    name: string;
    email: string;
    phone: string | null;
    address?: string | null;
    profileImage?: string | null;
  };
  onEdit?: () => void;
  onUpdate?: () => void;
}

/**
 * Get user initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Truncate address to a reasonable length
 */
function truncateAddress(address: string, maxLength: number = 50): string {
  if (address.length <= maxLength) {
    return address;
  }
  return address.substring(0, maxLength) + '...';
}

export function PersonalDetails({
  user,
  onEdit,
  onUpdate,
}: PersonalDetailsProps) {
  const initials = getInitials(user.name);
  const displayAddress = user.address ? truncateAddress(user.address) : null;

  return (
    <Card className="p-6 mb-6" style={{ backgroundColor: colors.primary }}>
      <div className="flex items-start gap-6">
        {/* Profile Picture with Avatar */}
        <div className="relative shrink-0">
          <div
            className="rounded-full overflow-hidden border-4"
            style={{
              borderColor: colors.white,
              width: '96px',
              height: '96px',
            }}
          >
            <Avatar className="w-24 h-24">
              {user.profileImage ? (
                <AvatarImage
                  src={
                    normalizeImageUrl(user.profileImage) || user.profileImage
                  }
                  alt={user.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback
                className="text-2xl font-semibold"
                style={{
                  backgroundColor: colors.primaryLight,
                  color: colors.white,
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: colors.white }}
          >
            Personal Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span style={{ color: colors.white }}>{user.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" style={{ color: colors.white }} />
              <span style={{ color: colors.white }}>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" style={{ color: colors.white }} />
                <span style={{ color: colors.white }}>{user.phone}</span>
              </div>
            )}
            {displayAddress && (
              <div className="flex items-center gap-3">
                <MapPin
                  className="w-5 h-5 shrink-0"
                  style={{ color: colors.white }}
                />
                <span
                  style={{ color: colors.white }}
                  title={user.address || undefined}
                >
                  {displayAddress}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Button */}
        {onEdit && (
          <Button
            onClick={onEdit}
            className="shrink-0"
            style={{
              backgroundColor: colors.black,
              color: colors.white,
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Personal Details
          </Button>
        )}
      </div>
    </Card>
  );
}
