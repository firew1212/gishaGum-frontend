'use client';

import {
FormEvent,
useEffect,
useState,
} from 'react';

import {
checkRoomAvailability,
getRoomTypes,
type Room,
type RoomType,
} from '@/src/lib/rooms-api';

interface RoomAvailabilitySearchProps {
onResults: (
rooms: Room[],
hasSearched: boolean,
) => void;
onLoading: (loading: boolean) => void;
onError: (message: string) => void;
}

function getToday(): string {
const today = new Date();

const year = today.getFullYear();
const month = String(
today.getMonth() + 1,
).padStart(2, '0');
const day = String(
today.getDate(),
).padStart(2, '0');

return `${year}-${month}-${day}`;
}

function getTomorrow(): string {
const tomorrow = new Date();
tomorrow.setDate(
tomorrow.getDate() + 1,
);

const year = tomorrow.getFullYear();
const month = String(
tomorrow.getMonth() + 1,
).padStart(2, '0');
const day = String(
tomorrow.getDate(),
).padStart(2, '0');

return `${year}-${month}-${day}`;
}

export default function RoomAvailabilitySearch({
onResults,
onLoading,
onError,
}: RoomAvailabilitySearchProps) {
const [checkIn, setCheckIn] = useState(
getToday(),
);
const [checkOut, setCheckOut] = useState(
getTomorrow(),
);
const [roomTypeId, setRoomTypeId] =
useState('');

const [roomTypes, setRoomTypes] = useState<
RoomType[]

> ([]);

const [loadingTypes, setLoadingTypes] =
useState(true);

useEffect(() => {
let mounted = true;


async function loadRoomTypes() {
  try {
    setLoadingTypes(true);

    const data = await getRoomTypes();

    if (mounted) {
      setRoomTypes(data);
    }
  } catch {
    if (mounted) {
      setRoomTypes([]);
    }
  } finally {
    if (mounted) {
      setLoadingTypes(false);
    }
  }
}

loadRoomTypes();

return () => {
  mounted = false;
};


}, []);

async function handleSubmit(
event: FormEvent<HTMLFormElement>,
) {
event.preventDefault();


onError('');

if (!checkIn || !checkOut) {
  onError(
    'Please select both check-in and check-out dates.',
  );
  return;
}

if (checkOut <= checkIn) {
  onError(
    'Check-out date must be after check-in date.',
  );
  return;
}

try {
  onLoading(true);

  const rooms =
    await checkRoomAvailability({
      checkIn,
      checkOut,
      roomTypeId:
        roomTypeId || undefined,
    });

  onResults(rooms, true);
} catch (error) {
  onResults([], true);

  onError(
    error instanceof Error
      ? error.message
      : 'Unable to check room availability.',
  );
} finally {
  onLoading(false);
}


}

function handleClear() {
setCheckIn(getToday());
setCheckOut(getTomorrow());
setRoomTypeId('');
onError('');
onResults([], false);
}

return ( <section
   className="availability-search-section"
   aria-label="Search room availability"
 > <div className="container"> <div className="availability-search-card"> <div className="availability-search-header"> <div> <span className="badge badge-primary">
Find your stay </span>


          <h2
            className="heading-md"
            style={{ marginTop: 12 }}
          >
            Check room availability
          </h2>

          <p
            className="text-muted"
            style={{
              marginTop: 7,
              lineHeight: 1.6,
            }}
          >
            Select your dates and find rooms
            available for your stay.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="availability-form"
      >
        <div className="form-group">
          <label
            htmlFor="check-in"
            className="form-label"
          >
            Check-in
          </label>

          <input
            id="check-in"
            type="date"
            className="form-input"
            value={checkIn}
            min={getToday()}
            onChange={(event) => {
              const value =
                event.target.value;

              setCheckIn(value);

              if (
                checkOut <= value
              ) {
                const nextDay =
                  new Date(`${value}T00:00:00`);

                nextDay.setDate(
                  nextDay.getDate() + 1,
                );

                const year =
                  nextDay.getFullYear();
                const month =
                  String(
                    nextDay.getMonth() + 1,
                  ).padStart(2, '0');
                const day =
                  String(
                    nextDay.getDate(),
                  ).padStart(2, '0');

                setCheckOut(
                  `${year}-${month}-${day}`,
                );
              }
            }}
            required
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="check-out"
            className="form-label"
          >
            Check-out
          </label>

          <input
            id="check-out"
            type="date"
            className="form-input"
            value={checkOut}
            min={checkIn || getTomorrow()}
            onChange={(event) =>
              setCheckOut(
                event.target.value,
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="room-type"
            className="form-label"
          >
            Room type
          </label>

          <select
            id="room-type"
            className="form-select"
            value={roomTypeId}
            onChange={(event) =>
              setRoomTypeId(
                event.target.value,
              )
            }
            disabled={loadingTypes}
          >
            <option value="">
              All room types
            </option>

            {roomTypes.map((type) => (
              <option
                key={type.id}
                value={type.id}
              >
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="availability-form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
          >
            Reset
          </button>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Check availability
          </button>
        </div>
      </form>
    </div>
  </div>
</section>


);
}
