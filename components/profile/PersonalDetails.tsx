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
    <Card
      className="p-4 sm:p-6 mb-4 sm:mb-6"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        {/* Profile Picture with Avatar */}
        <div className="relative shrink-0">
          <div
            className="rounded-full overflow-hidden border-2 sm:border-4 w-16 h-16 sm:w-24 sm:h-24"
            style={{
              borderColor: colors.white,
            }}
          >
            <Avatar className="w-full h-full">
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
                className="text-lg sm:text-2xl font-semibold"
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
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{ color: colors.white }}
            >
              Personal Details
            </h2>
            {/* Edit Button - Icon Only */}
            {onEdit && (
              <Button
                onClick={onEdit}
                size="icon"
                className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                style={{
                  backgroundColor: colors.black,
                  color: colors.white,
                }}
                aria-label="Edit Personal Details"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className="text-sm sm:text-base break-words"
                style={{ color: colors.white }}
              >
                {user.name}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Mail
                className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                style={{ color: colors.white }}
              />
              <span
                className="text-sm sm:text-base break-all"
                style={{ color: colors.white }}
              >
                {user.email}
              </span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 sm:gap-3">
                <Phone
                  className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                  style={{ color: colors.white }}
                />
                <span
                  className="text-sm sm:text-base break-words"
                  style={{ color: colors.white }}
                >
                  {user.phone}
                </span>
              </div>
            )}
            {displayAddress && (
              <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                <MapPin
                  className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5"
                  style={{ color: colors.white }}
                />
                <span
                  className="text-sm sm:text-base break-words"
                  style={{ color: colors.white }}
                  title={user.address || undefined}
                >
                  {displayAddress}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
