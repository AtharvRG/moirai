import dayjs from 'dayjs';

export const calculateAge = (dob: string): number => {
    return dayjs().diff(dayjs(dob), 'year');
};