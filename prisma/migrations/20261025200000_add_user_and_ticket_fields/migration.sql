-- Create the missing User table
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key` (`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add the missing Ticket fields
ALTER TABLE `Ticket`
    ADD COLUMN `assignedTo` VARCHAR(191) NULL DEFAULT 'Unassigned',
    ADD COLUMN `clientId` INTEGER NULL;

-- Add an index for the client relationship
CREATE INDEX `Ticket_clientId_idx` ON `Ticket` (`clientId`);

-- Link tickets to users
ALTER TABLE `Ticket`
    ADD CONSTRAINT `Ticket_clientId_fkey`
    FOREIGN KEY (`clientId`) REFERENCES `User` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;