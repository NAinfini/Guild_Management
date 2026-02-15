import React from 'react';
import { useTranslation } from 'react-i18next';
import { Primitives } from '@/components';

const {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Checkbox,
  Code,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Heading,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectSearch,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Text,
} = Primitives;

/**
 * DesignSystemPreview is the visual integration surface for primitive components.
 * It lives under a dedicated route so feature migration can validate token + behavior parity quickly.
 */
export function DesignSystemPreview() {
  const { t } = useTranslation();
  const [selectValue, setSelectValue] = React.useState('alpha');
  const [checkboxChecked, setCheckboxChecked] = React.useState(false);
  const [switchChecked, setSwitchChecked] = React.useState(false);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem', display: 'grid', gap: '1rem' }}>
      <Card variant="elevated">
        <CardHeader>
          <Heading level={2}>Design System Preview</Heading>
        </CardHeader>
        <CardContent>
          <Text as="p" color="secondary">
            {t('tools.nexus_studio.subtitle')}
          </Text>
        </CardContent>
      </Card>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Card variant="outlined">
          <CardHeader>
            <Heading level={4}>{t('showcase.buttons.variants')}</Heading>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Button variant="primary">{t('showcase.buttons.default')}</Button>
            <Button variant="secondary">{t('showcase.buttons.secondary')}</Button>
            <Button variant="ghost">{t('showcase.buttons.ghost')}</Button>
            <Button loading>{t('common.loading')}</Button>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={4}>{t('showcase.inputs.standard')}</Heading>
          </CardHeader>
          <CardContent style={{ display: 'grid', gap: '0.75rem' }}>
            <Label htmlFor="preview-input">{t('showcase.inputs.email')}</Label>
            <Input id="preview-input" placeholder={t('showcase.inputs.search')} />
            <Code>tokens: color + spacing + motion</Code>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={4}>{t('tools.nexus_studio.categories.choice_controls')}</Heading>
          </CardHeader>
          <CardContent style={{ display: 'grid', gap: '0.75rem' }}>
            <Checkbox
              checked={checkboxChecked}
              onCheckedChange={(checked) => setCheckboxChecked(Boolean(checked))}
              label="Preview checkbox"
            />
            <Switch
              checked={switchChecked}
              onCheckedChange={(checked) => setSwitchChecked(Boolean(checked))}
              label="Preview switch"
            />
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger aria-label="Preview select">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectSearch placeholder={t('common.search')} />
                <SelectItem value="alpha">Alpha</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="gamma">Gamma</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Text as="p" size="sm" color="secondary">
              Selected: {selectValue}
            </Text>
          </CardFooter>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={4}>{t('showcase.cards.interactive')}</Heading>
          </CardHeader>
          <CardContent style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Avatar name="Design System" />
              <Badge variant="info">{t('common.active')}</Badge>
            </div>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="rectangular" height={48} />
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Open preview dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('themeLab.theme_dialog_title')}</DialogTitle>
                </DialogHeader>
                <DialogDescription>{t('themeLab.theme_dialog_desc')}</DialogDescription>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
