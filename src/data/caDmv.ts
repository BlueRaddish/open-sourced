import type { StudySet } from '../types'

const categories = [
  'Signals & signs',
  'Lanes & turns',
  'Right-of-way',
  'Parking',
  'Speed & space',
  'Sharing the road',
  'Safe driving',
  'Laws & responsibility',
] as const

type Category = (typeof categories)[number]

type CardRow = readonly [
  category: Category,
  prompt: string,
  answer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string,
  section: string,
]

const rows: CardRow[] = [
  ['Signals & signs', 'What does a flashing red traffic light require?', 'Come to a full stop, then proceed when safe', 'Slow down without stopping', 'Stop only if cross traffic is present', 'Treat it like a yield sign', 'A flashing red light is handled like a STOP sign.', '§7 · Traffic signals'],
  ['Signals & signs', 'What does a flashing yellow traffic light mean?', 'Slow down and proceed with caution', 'Come to a complete stop', 'The signal is about to turn red', 'Only turning traffic may proceed', 'A flashing yellow is a warning; a stop is not required unless conditions demand it.', '§7 · Traffic signals'],
  ['Signals & signs', 'What does a red arrow mean?', 'Stop and do not turn until a green signal or arrow appears', 'Turn after a complete stop if clear', 'Yield, then turn in the arrow direction', 'Treat it as a flashing red light', 'California’s handbook says not to turn against a red arrow.', '§7 · Traffic signals'],
  ['Signals & signs', 'A traffic light is completely dark. How should you treat the intersection?', 'As an all-way stop', 'As an uncontrolled intersection', 'As a yield in your direction', 'The largest road has priority', 'Stop as though STOP signs control every direction, then proceed cautiously.', '§7 · Traffic signals'],
  ['Signals & signs', 'What does a flashing yellow arrow allow?', 'Turn after yielding to oncoming traffic', 'A protected turn with oncoming traffic stopped', 'No turn until a solid green arrow', 'Turn only after a complete stop', 'The turn is permitted but unprotected.', '§7 · Traffic signals'],
  ['Signals & signs', 'At a STOP sign with no limit line or crosswalk, where do you stop?', 'Before entering the intersection', 'At the far edge of the intersection', 'Beside the STOP sign', 'Where you can see traffic, even if inside the intersection', 'The order is limit line, crosswalk, then the entrance to the intersection.', '§7 · Signs'],
  ['Signals & signs', 'What does a five-sided sign warn of?', 'A school area', 'A railroad crossing', 'A no-passing zone', 'A hospital zone', 'The pentagon shape marks a school area or school crossing.', '§7 · Signs'],
  ['Signals & signs', 'At night, red roadway reflectors shining toward you usually mean:', 'You are traveling the wrong way', 'A stop sign is ahead', 'A railroad crossing is ahead', 'The lane is ending', 'Red reflectors facing you are a wrong-way warning.', '§7 · Signs'],

  ['Lanes & turns', 'When may you cross a single set of double solid yellow lines?', 'To turn left into or out of a driveway or private road when safe', 'To pass a slow vehicle', 'To enter a bike lane', 'To change into an HOV lane anywhere', 'You may cross one set for a permitted left turn or U-turn, but not to pass.', '§6 · Lane markings'],
  ['Lanes & turns', 'Two sets of double solid yellow lines at least two feet apart are:', 'A barrier you may cross only at designated openings', 'A center left-turn lane', 'A passing zone', 'An HOV entrance', 'Do not drive on or over this painted barrier or turn across it.', '§6 · Lane markings'],
  ['Lanes & turns', 'How far may you drive in a center left-turn lane?', 'Up to 200 feet', 'Up to 100 feet', 'Up to 300 feet', 'Any distance if traffic is clear', 'The lane is only for preparing for and making a left turn or U-turn.', '§6 · Center left-turn lanes'],
  ['Lanes & turns', 'When may a driver enter a bicycle lane to make a turn?', 'Within 200 feet of the intersection', 'Within 50 feet of the intersection', 'Within 500 feet of the intersection', 'Only after entering the intersection', 'Check blind spots and merge into the bike lane no more than 200 feet before the turn.', '§6 · Bicycle lanes'],
  ['Lanes & turns', 'How early should you signal before a normal turn?', 'At least 100 feet', 'At least 50 feet', 'At least 200 feet', 'Three seconds at any speed', 'Signal at least 100 feet before turning.', '§5 · Signaling'],
  ['Lanes & turns', 'How early should you signal before changing lanes on a freeway?', 'At least five seconds', 'At least two seconds', 'At least 100 feet', 'Only while crossing the lane line', 'The handbook specifies at least five seconds for freeway lane changes.', '§5 · Signaling'],
  ['Lanes & turns', 'May you change lanes across double solid white lines?', 'No; wait for a single broken white line', 'Yes, after signaling', 'Yes, only to enter an HOV lane', 'Only when traffic is below 25 mph', 'Double solid white lines form a lane barrier.', '§6 · Lane markings'],
  ['Lanes & turns', 'When can you turn left against a red light?', 'From a one-way street onto a one-way street, unless prohibited', 'From any street onto a one-way street', 'From a one-way street onto any street', 'Never in California', 'Yield to traffic and pedestrians with a green light before making this limited exception.', '§6 · Turns'],

  ['Right-of-way', 'At an uncontrolled intersection, two vehicles arrive at the same time. Who goes first?', 'The vehicle on the right', 'The vehicle on the left', 'The vehicle traveling faster', 'The larger vehicle', 'When arrival is simultaneous, yield to the road user on your right.', '§7 · Intersections'],
  ['Right-of-way', 'At an uncontrolled T intersection, who has the right-of-way?', 'Traffic on the through road', 'Traffic on the ending road', 'The vehicle turning left', 'Whichever vehicle arrives from the right', 'Road users continuing on the through road go first.', '§7 · Intersections'],
  ['Right-of-way', 'When entering a highway, who has the right-of-way?', 'Traffic already on the highway', 'Traffic on the on-ramp', 'The vehicle nearest the merge point', 'The faster vehicle', 'Match traffic speed and merge into a safe gap; highway traffic has priority.', '§6 · Merging'],
  ['Right-of-way', 'Who has the right-of-way in a marked or unmarked crosswalk?', 'Pedestrians', 'Vehicles if the crosswalk is unmarked', 'Vehicles on the larger road', 'The first road user to make eye contact', 'Marked or not, crosswalks require drivers to yield to pedestrians.', '§7 · Pedestrians'],
  ['Right-of-way', 'Two vehicles meet on a steep, narrow road where neither can pass. Who should back up?', 'The vehicle facing downhill', 'The vehicle facing uphill', 'The smaller vehicle', 'The vehicle closest to a turnout', 'The downhill-facing driver has more control backing uphill; the uphill-facing vehicle has priority.', '§7 · Mountain roads'],
  ['Right-of-way', 'You are inside an intersection when an emergency vehicle approaches with siren and red lights. What should you do?', 'Continue through, then pull right and stop when safe', 'Stop immediately inside the intersection', 'Back out of the intersection', 'Turn left to clear its path', 'Clear the intersection first, then move to the right edge and stop.', '§7 · Emergency vehicles'],
  ['Right-of-way', 'Before entering a roundabout, you must yield to:', 'All traffic already in the roundabout', 'Traffic entering behind you', 'Only vehicles in the left lane', 'No one if you are turning right', 'Enter to the right only after a safe gap opens.', '§7 · Roundabouts'],
  ['Right-of-way', 'A funeral procession led by a traffic officer is approaching. What should you do?', 'Yield; the procession has the right-of-way', 'Enter between vehicles if there is room', 'Proceed because processions must yield', 'Only yield at a red light', 'Do not interrupt an identified funeral procession led by an officer.', '§7 · Other roadway information'],

  ['Parking', 'How should you turn your wheels when parking downhill with a curb?', 'Toward the curb', 'Away from the curb', 'Straight ahead', 'Toward the center of the road', 'If the vehicle rolls, the front wheel should stop against the curb.', '§6 · Parking on a hill'],
  ['Parking', 'How should you turn your wheels when parking uphill with a curb?', 'Away from the curb', 'Toward the curb', 'Straight ahead', 'Either direction if the brake is set', 'Let the vehicle roll back slightly so the tire rests against the curb.', '§6 · Parking on a hill'],
  ['Parking', 'How should you turn your wheels when parking on a hill with no curb?', 'Toward the edge of the road', 'Toward the center of the road', 'Straight ahead', 'Away from the road only when facing uphill', 'Point the wheels so the vehicle would roll away from traffic.', '§6 · Parking on a hill'],
  ['Parking', 'What does a white curb mean?', 'Stop only long enough to pick up or drop off passengers', 'Short-term parking', 'Passenger or freight loading', 'No stopping at any time', 'White is for brief passenger loading or unloading.', '§6 · Colored curbs'],
  ['Parking', 'What does a green curb mean?', 'Limited-time parking', 'Passenger loading only', 'Commercial loading only', 'Disabled parking only', 'The time limit is shown on a sign or painted on the curb.', '§6 · Colored curbs'],
  ['Parking', 'What does a yellow curb generally allow?', 'Loading and unloading passengers or freight for the posted time', 'Unlimited parking after business hours', 'Disabled parking', 'No stopping or standing', 'A noncommercial driver is usually required to stay with the vehicle.', '§6 · Colored curbs'],
  ['Parking', 'How close may you park to a fire hydrant?', 'No closer than 15 feet', 'No closer than 10 feet', 'No closer than 20 feet', 'No closer than 25 feet', 'Never park within 15 feet of a fire hydrant or fire station driveway.', '§6 · Illegal parking'],
  ['Parking', 'How close may you park to a marked or unmarked crosswalk without a curb extension?', 'No closer than 20 feet', 'No closer than 10 feet', 'No closer than 15 feet', 'No closer than 25 feet', 'The general buffer is 20 feet; it is 15 feet where a curb extension is present.', '§6 · Illegal parking'],

  ['Speed & space', 'What is California’s Basic Speed Law?', 'Never drive faster than is safe for current conditions', 'Always drive exactly at the posted limit', 'Match the fastest traffic around you', 'Stay within 10 mph of the posted limit', 'Conditions can require a speed below the posted maximum.', '§8 · Manage your speed'],
  ['Speed & space', 'Unless posted otherwise, what is the maximum speed on most California highways?', '65 mph', '55 mph', '70 mph', '75 mph', 'The handbook lists 65 mph for most highways.', '§8 · Manage your speed'],
  ['Speed & space', 'Unless posted otherwise, what is the maximum on a two-lane undivided highway?', '55 mph', '45 mph', '60 mph', '65 mph', 'The same 55 mph limit applies to vehicles towing trailers.', '§8 · Manage your speed'],
  ['Speed & space', 'What is the speed limit at a blind intersection?', '15 mph', '10 mph', '20 mph', '25 mph', 'Move forward slowly until you can see; the limit is 15 mph.', '§7 · Blind intersections'],
  ['Speed & space', 'What is the speed limit in an alley?', '15 mph', '10 mph', '20 mph', '25 mph', 'California defines this handbook limit as 15 mph.', '§7 · Alleys'],
  ['Speed & space', 'Near a school with children outside or crossing, the usual limit within 500 feet is:', '25 mph', '15 mph in every school zone', '20 mph', '30 mph', 'Some posted school zones are as low as 15 mph, but the usual handbook rule is 25 mph.', '§7 · Around children'],
  ['Speed & space', 'What following-distance rule should you normally use?', 'At least three seconds', 'At least one second', 'At least two car lengths', 'At least five seconds in all conditions', 'Choose a fixed point and keep at least a three-second gap; add more in poor conditions.', '§8 · Tailgating'],
  ['Speed & space', 'How far ahead should you scan the road?', 'At least 10 seconds', 'At least 3 seconds', 'At least 5 seconds', 'At least 20 seconds', 'Keeping your eyes moving and scanning 10 seconds ahead gives time to react.', '§8 · Scan your surroundings'],

  ['Sharing the road', 'If you cannot change lanes to pass a bicyclist, how much clearance is required?', 'At least three feet', 'At least two feet', 'At least four feet', 'One full car width', 'Wait to pass if you cannot provide three feet.', '§7 · Passing a bicyclist'],
  ['Sharing the road', 'A school bus ahead flashes yellow lights. What should you do?', 'Slow down and prepare to stop', 'Stop immediately', 'Pass before the red lights begin', 'Honk to warn children', 'Yellow lights warn that the bus is preparing to stop.', '§7 · Around children'],
  ['Sharing the road', 'A school bus flashes red lights on an undivided road. What must traffic do?', 'Stop in both directions until the lights stop flashing', 'Only traffic behind the bus must stop', 'Slow to 15 mph and pass carefully', 'Stop only while children are visible', 'Remain stopped from either direction while the red lights flash.', '§7 · Around children'],
  ['Sharing the road', 'When are you not required to stop for a school bus flashing red lights in the opposite direction?', 'When it is across a divided or multilane highway with at least two lanes each way', 'When you are more than 200 feet away', 'When the bus is stopped at an intersection', 'When no children are visible', 'The divided/multilane highway exception applies to opposing traffic.', '§7 · Around children'],
  ['Sharing the road', 'What following distance should you allow behind a motorcycle?', 'At least three seconds', 'At least one second', 'At least two seconds', 'Exactly four car lengths', 'Motorcycles may stop quickly or fall, so preserve a safe three-second gap.', '§7 · Motorcycles'],
  ['Sharing the road', 'When a stationary emergency or road-work vehicle displays flashing lights, you must:', 'Move over and slow down', 'Stop in your lane', 'Maintain speed to pass quickly', 'Move left without checking traffic', 'Change lanes away when safe and reduce speed.', '§7 · Move over and slow down'],
  ['Sharing the road', 'On a two-lane road, when must a slow driver use a turnout?', 'When passing is unsafe and five or more vehicles are following', 'Whenever two vehicles are following', 'Only when directed by a sign', 'When traveling 10 mph below the limit', 'Use the turnout to let the line of five or more vehicles pass.', '§6 · Turnout areas'],
  ['Sharing the road', 'May a car and motorcycle legally share a lane in California?', 'Lane splitting by motorcycles is legal, but drivers should give the full lane when possible', 'No, sharing a lane is always illegal', 'Yes, but only below 25 mph', 'Only on highways with three lanes', 'Never try to pass a motorcycle within the same lane; allow room for lawful lane splitting.', '§7 · Motorcycles'],

  ['Safe driving', 'When must you dim high beams for an oncoming vehicle?', 'Within 500 feet', 'Within 200 feet', 'Within 300 feet', 'Within 1,000 feet', 'Switch to low beams within 500 feet of oncoming traffic.', '§5 · Headlights'],
  ['Safe driving', 'When must you dim high beams for a vehicle you are following?', 'Within 300 feet', 'Within 100 feet', 'Within 500 feet', 'Within 1,000 feet', 'Use low beams when following within 300 feet.', '§5 · Headlights'],
  ['Safe driving', 'If weather requires windshield wipers, what else is required?', 'Low-beam headlights', 'High-beam headlights', 'Emergency flashers', 'Parking lights only', 'California requires low beams with wipers in fog, rain, or snow.', '§5 · Headlights'],
  ['Safe driving', 'Your vehicle starts to hydroplane. What should you do?', 'Slow down gradually and do not brake suddenly', 'Brake firmly', 'Turn sharply toward the shoulder', 'Accelerate to regain traction', 'Sudden braking or steering can cause a skid.', '§8 · Hydroplaning'],
  ['Safe driving', 'Your vehicle begins to skid. Which way should you steer?', 'In the direction of the skid', 'Opposite the skid', 'Straight ahead regardless of movement', 'Toward the nearest shoulder', 'Ease off the accelerator, avoid braking, and steer with the skid.', '§8 · Skids'],
  ['Safe driving', 'In heavy fog, which headlights should you use?', 'Low beams', 'High beams', 'Parking lights only', 'Emergency flashers while moving', 'High beams reflect off fog and create glare.', '§8 · Fog or heavy smoke'],
  ['Safe driving', 'If you cannot see farther than 100 feet in heavy rain or snow, it is unsafe to exceed:', '30 mph', '20 mph', '40 mph', '45 mph', 'The handbook gives 30 mph as the upper safe speed at 100-foot visibility.', '§8 · Slippery roads'],
  ['Safe driving', 'Where should the lap portion of a seat belt lie?', 'Snug and low across the hips', 'Across the stomach', 'Loosely across the thighs', 'Above the waist', 'A low, snug lap belt helps prevent sliding out in a crash.', '§8 · Seat belts'],

  ['Laws & responsibility', 'What is the illegal BAC threshold for a driver age 21 or older?', '0.08%', '0.01%', '0.04%', '0.10%', 'A driver can still be arrested below this threshold if impaired.', '§9 · BAC limits'],
  ['Laws & responsibility', 'What is the illegal BAC threshold for a driver under 21?', '0.01%', '0.00%', '0.04%', '0.08%', 'California’s under-21 limit is 0.01%.', '§9 · BAC limits'],
  ['Laws & responsibility', 'What BAC limit applies to commercial drivers and drivers carrying passengers for hire?', '0.04%', '0.01%', '0.06%', '0.08%', 'Both categories have a 0.04% limit.', '§9 · BAC limits'],
  ['Laws & responsibility', 'Where must an opened alcohol or cannabis container be kept in a vehicle?', 'In the trunk or another area where passengers do not sit', 'In a locked glove box', 'Under a passenger seat', 'In any cupholder if the driver does not use it', 'An open container may not be in the passenger area or glove box.', '§9 · Alcohol and cannabis products'],
  ['Laws & responsibility', 'What is the rule for an adult using a phone while driving?', 'Use it only hands-free when necessary', 'Handheld use is allowed below 25 mph', 'One hand may hold the phone for navigation', 'Texting is allowed at red lights', 'A mounted phone may be operated with a single swipe or touch; handheld use is illegal.', '§8 · Cell phones and texting'],
  ['Laws & responsibility', 'When must a collision be reported to DMV within 10 days?', 'If anyone is injured or killed, or property damage exceeds $1,000', 'Only when you caused the collision', 'Whenever police come to the scene', 'Only when damage exceeds $5,000', 'Each driver files an SR 1, even for a collision on private property.', '§10 · Reporting a collision'],
  ['Laws & responsibility', 'What are California’s minimum liability insurance limits in this handbook?', '$30,000 / $60,000 / $15,000', '$15,000 / $30,000 / $5,000', '$25,000 / $50,000 / $10,000', '$50,000 / $100,000 / $25,000', 'The amounts cover one injury/death, multiple injuries/deaths, and property damage.', '§10 · Insurance requirements'],
  ['Laws & responsibility', 'How many attempts do you get to pass the knowledge test before reapplying?', 'Three attempts', 'Two attempts', 'Four attempts', 'Unlimited attempts for one year', 'After three failed attempts, a new application is required.', '§3 · Knowledge test'],
]

export const caDmvSet: StudySet = {
  id: 'builtin-ca-dmv-2025',
  title: 'California Driver Knowledge Test',
  subject: 'California DMV',
  description: '64 focused questions adapted from the 2025 California Driver\'s Handbook. Independent study aid—not an official DMV practice test.',
  color: '#3478a6',
  testSize: 36,
  sources: [
    'California Driver\'s Handbook (2025), California Department of Motor Vehicles',
    'https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/',
  ],
  createdAt: '2026-08-25T00:00:00.000Z',
  updatedAt: '2026-08-25T00:00:00.000Z',
  cards: rows.map((row, index) => ({
    id: `ca-dmv-${String(index + 1).padStart(3, '0')}`,
    term: row[1],
    definition: row[2],
    choices: [row[2], row[3], row[4], row[5]],
    category: row[0],
    note: `${row[6]} · ${row[7]}`,
  })),
}

