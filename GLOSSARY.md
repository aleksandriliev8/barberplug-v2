# BarberPlug

Public website for a single barbershop, plus a small admin area where the Owner manages the Gallery and page wording.

## People

**Owner**:
The business owner and the only person who can sign in to the admin area.
_Avoid_: Admin, user, manager

**Visitor**:
Anyone browsing the public site without signing in.
_Avoid_: User, customer, client

## Content

**Section**:
One of the public areas of the site: Learn More, Shop, Gallery, Location, Book Now, Help.
_Avoid_: Tab, module

**Gallery Image**:
A photo shown in the Gallery, placed in an order chosen by the Owner, with an optional Bulgarian and English caption.
_Avoid_: Picture, photo, media

**Editable Text**:
A predefined title or paragraph on a page whose Bulgarian and English wording the Owner can change.
_Avoid_: Content block, CMS field, copy

**Contact Message**:
A message a Visitor sends to the shop through the Help form.
_Avoid_: Inquiry, ticket, lead

## External

**Booking**:
An appointment a Visitor makes in Fresha. Bookings never exist in this system.
_Avoid_: Reservation, appointment (when meaning our own data)

## Language

**Locale**:
The language a page is shown in: Bulgarian (`bg`) or English (`en`).
_Avoid_: Language version, translation
