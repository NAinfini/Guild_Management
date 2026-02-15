import React, { forwardRef } from 'react';

/**
 * Temporary icon shim for phased migration off MUI icons.
 */

export type SvgIconComponent = React.ComponentType<any>;

const createIcon = (name: string) =>
  forwardRef<SVGSVGElement, any>(function ShimIcon(props, ref) {
    const { titleAccess, children, style, ...rest } = props || {};
    return (
      React.createElement('svg', {
        ref,
        viewBox: '0 0 24 24',
        width: '1em',
        height: '1em',
        fill: 'currentColor',
        role: 'img',
        'aria-label': titleAccess || name,
        ...rest,
        style,
      },
      React.createElement('title', null, titleAccess || name),
      React.createElement('rect', { x: 4, y: 4, width: 16, height: 16, rx: 2, ry: 2 }),
      children)
    );
  });

export const AccessTime = createIcon('AccessTime');
export const AccessibilityNew = createIcon('AccessibilityNew');
export const Add = createIcon('Add');
export const AdminPanelSettings = createIcon('AdminPanelSettings');
export const Animation = createIcon('Animation');
export const Architecture = createIcon('Architecture');
export const Archive = createIcon('Archive');
export const ArrowDownward = createIcon('ArrowDownward');
export const ArrowForward = createIcon('ArrowForward');
export const ArrowUpward = createIcon('ArrowUpward');
export const AttachFile = createIcon('AttachFile');
export const AutoAwesome = createIcon('AutoAwesome');
export const BarChart = createIcon('BarChart');
export const Block = createIcon('Block');
export const Bolt = createIcon('Bolt');
export const Book = createIcon('Book');
export const Bookmark = createIcon('Bookmark');
export const Bookmarks = createIcon('Bookmarks');
export const Build = createIcon('Build');
export const CalendarMonth = createIcon('CalendarMonth');
export const CalendarToday = createIcon('CalendarToday');
export const Campaign = createIcon('Campaign');
export const Castle = createIcon('Castle');
export const Check = createIcon('Check');
export const CheckCircle = createIcon('CheckCircle');
export const ChevronLeft = createIcon('ChevronLeft');
export const ChevronRight = createIcon('ChevronRight');
export const Circle = createIcon('Circle');
export const Clear = createIcon('Clear');
export const Close = createIcon('Close');
export const Cloud = createIcon('Cloud');
export const CloudUpload = createIcon('CloudUpload');
export const ColorLens = createIcon('ColorLens');
export const ContentCopy = createIcon('ContentCopy');
export const Dangerous = createIcon('Dangerous');
export const DarkMode = createIcon('DarkMode');
export const Dashboard = createIcon('Dashboard');
export const DashboardCustomize = createIcon('DashboardCustomize');
export const Delete = createIcon('Delete');
export const Description = createIcon('Description');
export const Dns = createIcon('Dns');
export const Download = createIcon('Download');
export const DragIndicator = createIcon('DragIndicator');
export const Edit = createIcon('Edit');
export const ElectricBolt = createIcon('ElectricBolt');
export const EmojiEvents = createIcon('EmojiEvents');
export const EmojiFlags = createIcon('EmojiFlags');
export const Error = createIcon('Error');
export const ErrorOutline = createIcon('ErrorOutline');
export const ExpandLess = createIcon('ExpandLess');
export const ExpandMore = createIcon('ExpandMore');
export const Favorite = createIcon('Favorite');
export const FileUpload = createIcon('FileUpload');
export const FilterList = createIcon('FilterList');
export const FlashOn = createIcon('FlashOn');
export const FormatSize = createIcon('FormatSize');
export const GridView = createIcon('GridView');
export const Groups = createIcon('Groups');
export const HighlightOff = createIcon('HighlightOff');
export const History = createIcon('History');
export const Home = createIcon('Home');
export const HorizontalRule = createIcon('HorizontalRule');
export const Image = createIcon('Image');
export const Info = createIcon('Info');
export const Insights = createIcon('Insights');
export const Keyboard = createIcon('Keyboard');
export const KeyboardArrowDown = createIcon('KeyboardArrowDown');
export const Language = createIcon('Language');
export const Layers = createIcon('Layers');
export const LibraryAdd = createIcon('LibraryAdd');
export const LocalFireDepartment = createIcon('LocalFireDepartment');
export const Lock = createIcon('Lock');
export const LockOpen = createIcon('LockOpen');
export const Login = createIcon('Login');
export const Logout = createIcon('Logout');
export const Mail = createIcon('Mail');
export const ManageAccounts = createIcon('ManageAccounts');
export const Memory = createIcon('Memory');
export const Menu = createIcon('Menu');
export const MenuBook = createIcon('MenuBook');
export const MenuOpen = createIcon('MenuOpen');
export const Message = createIcon('Message');
export const Mic = createIcon('Mic');
export const MilitaryTech = createIcon('MilitaryTech');
export const Mood = createIcon('Mood');
export const MoreHoriz = createIcon('MoreHoriz');
export const MoreVert = createIcon('MoreVert');
export const MusicNote = createIcon('MusicNote');
export const Notifications = createIcon('Notifications');
export const OpenInFull = createIcon('OpenInFull');
export const OpenInNew = createIcon('OpenInNew');
export const Paid = createIcon('Paid');
export const Palette = createIcon('Palette');
export const Pause = createIcon('Pause');
export const People = createIcon('People');
export const Person = createIcon('Person');
export const PersonAdd = createIcon('PersonAdd');
export const PersonRemove = createIcon('PersonRemove');
export const Photo = createIcon('Photo');
export const PhotoCamera = createIcon('PhotoCamera');
export const Place = createIcon('Place');
export const PlayArrow = createIcon('PlayArrow');
export const PrecisionManufacturing = createIcon('PrecisionManufacturing');
export const Public = createIcon('Public');
export const PushPin = createIcon('PushPin');
export const Redo = createIcon('Redo');
export const Refresh = createIcon('Refresh');
export const Remove = createIcon('Remove');
export const ReportProblem = createIcon('ReportProblem');
export const RotateLeft = createIcon('RotateLeft');
export const Save = createIcon('Save');
export const Search = createIcon('Search');
export const Security = createIcon('Security');
export const SentimentSatisfiedAlt = createIcon('SentimentSatisfiedAlt');
export const Settings = createIcon('Settings');
export const Share = createIcon('Share');
export const Shield = createIcon('Shield');
export const SkipNext = createIcon('SkipNext');
export const SkipPrevious = createIcon('SkipPrevious');
export const Speed = createIcon('Speed');
export const Star = createIcon('Star');
export const Storage = createIcon('Storage');
export const Terminal = createIcon('Terminal');
export const TextFields = createIcon('TextFields');
export const Translate = createIcon('Translate');
export const TrendingUp = createIcon('TrendingUp');
export const Tune = createIcon('Tune');
export const Undo = createIcon('Undo');
export const UnfoldMore = createIcon('UnfoldMore');
export const Upload = createIcon('Upload');
export const VerifiedUser = createIcon('VerifiedUser');
export const Videocam = createIcon('Videocam');
export const ViewColumn = createIcon('ViewColumn');
export const ViewList = createIcon('ViewList');
export const Visibility = createIcon('Visibility');
export const VisibilityOff = createIcon('VisibilityOff');
export const VolumeDown = createIcon('VolumeDown');
export const VolumeOff = createIcon('VolumeOff');
export const VolumeUp = createIcon('VolumeUp');
export const VpnKey = createIcon('VpnKey');
export const Warning = createIcon('Warning');
export const WarningAmber = createIcon('WarningAmber');
export const WbSunny = createIcon('WbSunny');
export const WifiOff = createIcon('WifiOff');
export const WorkspacePremium = createIcon('WorkspacePremium');
export const ZoomIn = createIcon('ZoomIn');

export default createIcon('Icon');
